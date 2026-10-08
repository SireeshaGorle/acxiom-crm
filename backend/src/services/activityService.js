import prisma from '../config/prisma.js';
import { createAuditLog } from './auditService.js';
import { buildRoleBasedWhereClause } from '../middleware/rbac.js';

export const getActivities = async ({ page = 1, limit = 10, search = '', type, status, user }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let where = {};

  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { lead: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }

  where = buildRoleBasedWhereClause(user, where);

  const [total, activities] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.findMany({
      where,
      skip,
      take,
      orderBy: { activityDate: 'desc' },
      include: {
        customer: { select: { id: true, customerCode: true, name: true, companyName: true } },
        lead: { select: { id: true, leadCode: true, name: true, companyName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } }
      }
    })
  ]);

  return { activities, total, page, limit };
};

export const createActivity = async (data, user, ipAddress) => {
  const newActivity = await prisma.activity.create({
    data: {
      type: data.type || 'CALL',
      subject: data.subject.trim(),
      description: data.description?.trim() || null,
      activityDate: data.activityDate ? new Date(data.activityDate) : new Date(),
      customerId: data.customerId ? Number(data.customerId) : null,
      leadId: data.leadId ? Number(data.leadId) : null,
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
    entity: 'ACTIVITY',
    recordId: String(newActivity.id),
    newValue: newActivity,
    ipAddress
  });

  return newActivity;
};

export const updateActivity = async (id, data, user, ipAddress) => {
  const activityId = Number(id);
  const existing = await prisma.activity.findUnique({
    where: { id: activityId }
  });

  if (!existing) {
    const error = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && existing.assignedToId !== user.id && existing.createdById !== user.id) {
    const error = new Error('Access denied to modify this activity');
    error.statusCode = 403;
    throw error;
  }

  const updatedActivity = await prisma.activity.update({
    where: { id: activityId },
    data: {
      type: data.type !== undefined ? data.type : existing.type,
      subject: data.subject !== undefined ? data.subject.trim() : existing.subject,
      description: data.description !== undefined ? data.description.trim() : existing.description,
      activityDate: data.activityDate !== undefined ? new Date(data.activityDate) : existing.activityDate,
      customerId: data.customerId !== undefined ? (data.customerId ? Number(data.customerId) : null) : existing.customerId,
      leadId: data.leadId !== undefined ? (data.leadId ? Number(data.leadId) : null) : existing.leadId,
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
    entity: 'ACTIVITY',
    recordId: String(activityId),
    oldValue: existing,
    newValue: updatedActivity,
    ipAddress
  });

  return updatedActivity;
};

export const deleteActivity = async (id, user, ipAddress) => {
  const activityId = Number(id);
  const existing = await prisma.activity.findUnique({
    where: { id: activityId }
  });

  if (!existing) {
    const error = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.activity.delete({
    where: { id: activityId }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'DELETE',
    entity: 'ACTIVITY',
    recordId: String(activityId),
    oldValue: existing,
    ipAddress
  });

  return true;
};
