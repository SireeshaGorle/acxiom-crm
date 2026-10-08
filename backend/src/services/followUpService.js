import prisma from '../config/prisma.js';
import { createAuditLog } from './auditService.js';
import { buildRoleBasedWhereClause } from '../middleware/rbac.js';

export const getFollowUps = async ({ page = 1, limit = 10, search = '', status, type, filterTime, user }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let where = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (filterTime === 'upcoming') {
    where.followUpDate = { gte: endOfToday };
    where.status = 'PLANNED';
  } else if (filterTime === 'today') {
    where.followUpDate = { gte: startOfToday, lte: endOfToday };
  } else if (filterTime === 'overdue') {
    where.followUpDate = { lt: startOfToday };
    where.status = 'PLANNED';
  }

  if (search) {
    where.OR = [
      { remarks: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { lead: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  where = buildRoleBasedWhereClause(user, where);

  const [total, followUps] = await Promise.all([
    prisma.followUp.count({ where }),
    prisma.followUp.findMany({
      where,
      skip,
      take,
      orderBy: { followUpDate: 'asc' },
      include: {
        customer: { select: { id: true, customerCode: true, name: true, companyName: true, phone: true } },
        lead: { select: { id: true, leadCode: true, name: true, companyName: true, phone: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } }
      }
    })
  ]);

  return { followUps, total, page, limit };
};

export const getFollowUpById = async (id, user) => {
  const followUpId = Number(id);
  const followUp = await prisma.followUp.findUnique({
    where: { id: followUpId },
    include: {
      customer: true,
      lead: true,
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });

  if (!followUp) {
    const error = new Error('Follow-up record not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && followUp.assignedToId !== user.id && followUp.createdById !== user.id) {
    const error = new Error('Access denied to this follow-up record');
    error.statusCode = 403;
    throw error;
  }

  return followUp;
};

export const createFollowUp = async (data, user, ipAddress) => {
  const followUpDate = new Date(data.followUpDate);

  const newFollowUp = await prisma.followUp.create({
    data: {
      customerId: data.customerId ? Number(data.customerId) : null,
      leadId: data.leadId ? Number(data.leadId) : null,
      followUpDate,
      type: data.type || 'CALL',
      remarks: data.remarks.trim(),
      status: data.status || 'PLANNED',
      createdById: user.id,
      assignedToId: data.assignedToId ? Number(data.assignedToId) : user.id
    },
    include: {
      customer: { select: { name: true } },
      lead: { select: { name: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'CREATE',
    entity: 'FOLLOWUP',
    recordId: String(newFollowUp.id),
    newValue: newFollowUp,
    ipAddress
  });

  return newFollowUp;
};

export const updateFollowUp = async (id, data, user, ipAddress) => {
  const followUpId = Number(id);
  const existing = await prisma.followUp.findUnique({
    where: { id: followUpId }
  });

  if (!existing) {
    const error = new Error('Follow-up not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && existing.assignedToId !== user.id && existing.createdById !== user.id) {
    const error = new Error('Access denied to modify this follow-up');
    error.statusCode = 403;
    throw error;
  }

  const updatedFollowUp = await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      customerId: data.customerId !== undefined ? (data.customerId ? Number(data.customerId) : null) : existing.customerId,
      leadId: data.leadId !== undefined ? (data.leadId ? Number(data.leadId) : null) : existing.leadId,
      followUpDate: data.followUpDate !== undefined ? new Date(data.followUpDate) : existing.followUpDate,
      type: data.type !== undefined ? data.type : existing.type,
      remarks: data.remarks !== undefined ? data.remarks.trim() : existing.remarks,
      status: data.status !== undefined ? data.status : existing.status,
      assignedToId: data.assignedToId !== undefined ? (data.assignedToId ? Number(data.assignedToId) : null) : existing.assignedToId
    },
    include: {
      customer: { select: { name: true } },
      lead: { select: { name: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: data.status && data.status !== existing.status ? 'STATUS_CHANGE' : 'UPDATE',
    entity: 'FOLLOWUP',
    recordId: String(followUpId),
    oldValue: existing,
    newValue: updatedFollowUp,
    ipAddress
  });

  return updatedFollowUp;
};

export const deleteFollowUp = async (id, user, ipAddress) => {
  const followUpId = Number(id);
  const existing = await prisma.followUp.findUnique({
    where: { id: followUpId }
  });

  if (!existing) {
    const error = new Error('Follow-up not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.followUp.delete({
    where: { id: followUpId }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'DELETE',
    entity: 'FOLLOWUP',
    recordId: String(followUpId),
    oldValue: existing,
    ipAddress
  });

  return true;
};
