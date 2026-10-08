import prisma from '../config/prisma.js';
import { generateCode } from '../utils/codeGenerator.js';
import { createAuditLog } from './auditService.js';
import { buildRoleBasedWhereClause } from '../middleware/rbac.js';

export const getOpportunities = async ({ page = 1, limit = 10, search = '', stage, status, user }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let where = {};

  if (stage) {
    where.stage = stage;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { opportunityCode: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { companyName: { contains: search, mode: 'insensitive' } } }
    ];
  }

  where = buildRoleBasedWhereClause(user, where);

  const [total, opportunities] = await Promise.all([
    prisma.opportunity.count({ where }),
    prisma.opportunity.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, customerCode: true, name: true, companyName: true } },
        lead: { select: { id: true, leadCode: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } }
      }
    })
  ]);

  // Append computed weighted value: amount * (probability / 100)
  const opportunitiesWithWeighted = opportunities.map(opp => ({
    ...opp,
    weightedValue: Number(((opp.amount * opp.probability) / 100).toFixed(2))
  }));

  return { opportunities: opportunitiesWithWeighted, total, page, limit };
};

export const getOpportunityById = async (id, user) => {
  const oppId = Number(id);
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: oppId },
    include: {
      customer: true,
      lead: true,
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });

  if (!opportunity) {
    const error = new Error('Opportunity not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && opportunity.assignedToId !== user.id && opportunity.createdById !== user.id) {
    const error = new Error('Access denied to this opportunity record');
    error.statusCode = 403;
    throw error;
  }

  return {
    ...opportunity,
    weightedValue: Number(((opportunity.amount * opportunity.probability) / 100).toFixed(2))
  };
};

export const createOpportunity = async (data, user, ipAddress) => {
  const customerId = Number(data.customerId);
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    const error = new Error('Selected customer does not exist');
    error.statusCode = 404;
    throw error;
  }

  const count = await prisma.opportunity.count();
  const opportunityCode = generateCode('OPP', count);

  let status = data.status || 'OPEN';
  if (data.stage === 'WON') status = 'WON';
  if (data.stage === 'LOST') status = 'LOST';

  const newOpp = await prisma.opportunity.create({
    data: {
      opportunityCode,
      name: data.name.trim(),
      customerId,
      leadId: data.leadId ? Number(data.leadId) : null,
      amount: Number(data.amount),
      stage: data.stage || 'QUALIFICATION',
      probability: data.probability !== undefined ? Number(data.probability) : 10,
      expectedCloseDate: new Date(data.expectedCloseDate),
      status,
      notes: data.notes?.trim() || null,
      createdById: user.id,
      assignedToId: data.assignedToId ? Number(data.assignedToId) : user.id
    },
    include: {
      customer: { select: { id: true, customerCode: true, name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'CREATE',
    entity: 'OPPORTUNITY',
    recordId: String(newOpp.id),
    newValue: newOpp,
    ipAddress
  });

  return {
    ...newOpp,
    weightedValue: Number(((newOpp.amount * newOpp.probability) / 100).toFixed(2))
  };
};

export const updateOpportunity = async (id, data, user, ipAddress) => {
  const oppId = Number(id);
  const existing = await prisma.opportunity.findUnique({
    where: { id: oppId }
  });

  if (!existing) {
    const error = new Error('Opportunity not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && existing.assignedToId !== user.id && existing.createdById !== user.id) {
    const error = new Error('Access denied to modify this opportunity');
    error.statusCode = 403;
    throw error;
  }

  let status = data.status !== undefined ? data.status : existing.status;
  const stage = data.stage !== undefined ? data.stage : existing.stage;
  if (stage === 'WON') status = 'WON';
  if (stage === 'LOST') status = 'LOST';
  if (['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'].includes(stage) && !data.status) {
    status = 'OPEN';
  }

  const updatedOpp = await prisma.opportunity.update({
    where: { id: oppId },
    data: {
      name: data.name !== undefined ? data.name.trim() : existing.name,
      customerId: data.customerId !== undefined ? Number(data.customerId) : existing.customerId,
      leadId: data.leadId !== undefined ? (data.leadId ? Number(data.leadId) : null) : existing.leadId,
      amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
      stage,
      probability: data.probability !== undefined ? Number(data.probability) : existing.probability,
      expectedCloseDate: data.expectedCloseDate !== undefined ? new Date(data.expectedCloseDate) : existing.expectedCloseDate,
      status,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      assignedToId: data.assignedToId !== undefined ? (data.assignedToId ? Number(data.assignedToId) : null) : existing.assignedToId
    },
    include: {
      customer: { select: { id: true, customerCode: true, name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: stage !== existing.stage ? 'STATUS_CHANGE' : 'UPDATE',
    entity: 'OPPORTUNITY',
    recordId: String(oppId),
    oldValue: existing,
    newValue: updatedOpp,
    ipAddress
  });

  return {
    ...updatedOpp,
    weightedValue: Number(((updatedOpp.amount * updatedOpp.probability) / 100).toFixed(2))
  };
};

export const deleteOpportunity = async (id, user, ipAddress) => {
  const oppId = Number(id);
  const existing = await prisma.opportunity.findUnique({
    where: { id: oppId }
  });

  if (!existing) {
    const error = new Error('Opportunity not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE') {
    const error = new Error('Sales Executives cannot delete opportunities');
    error.statusCode = 403;
    throw error;
  }

  await prisma.opportunity.delete({
    where: { id: oppId }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'DELETE',
    entity: 'OPPORTUNITY',
    recordId: String(oppId),
    oldValue: existing,
    ipAddress
  });

  return true;
};
