import prisma from '../config/prisma.js';
import { generateCode } from '../utils/codeGenerator.js';
import { createAuditLog } from './auditService.js';
import { buildRoleBasedWhereClause } from '../middleware/rbac.js';

export const getLeads = async ({ page = 1, limit = 10, search = '', status, source, user }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let where = {};

  if (status) {
    where.status = status;
  }

  if (source) {
    where.source = source;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { leadCode: { contains: search, mode: 'insensitive' } }
    ];
  }

  where = buildRoleBasedWhereClause(user, where);

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        convertedCustomer: { select: { id: true, customerCode: true, name: true } },
        _count: {
          select: { opportunities: true, followUps: true, activities: true }
        }
      }
    })
  ]);

  return { leads, total, page, limit };
};

export const getLeadById = async (id, user) => {
  const leadId = Number(id);
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      convertedCustomer: { select: { id: true, customerCode: true, name: true, email: true } },
      opportunities: {
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } }
      },
      followUps: {
        orderBy: { followUpDate: 'desc' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } }
      },
      activities: {
        orderBy: { activityDate: 'desc' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } }
      }
    }
  });

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && lead.assignedToId !== user.id && lead.createdById !== user.id) {
    const error = new Error('Access denied to this lead record');
    error.statusCode = 403;
    throw error;
  }

  return lead;
};

export const createLead = async (data, user, ipAddress) => {
  const count = await prisma.lead.count();
  const leadCode = generateCode('LEAD', count);

  const newLead = await prisma.lead.create({
    data: {
      leadCode,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      companyName: data.companyName.trim(),
      source: data.source || 'WEBSITE',
      status: data.status || 'NEW',
      estimatedValue: Number(data.estimatedValue) || 0,
      notes: data.notes?.trim() || null,
      createdById: user.id,
      assignedToId: data.assignedToId ? Number(data.assignedToId) : user.id
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'CREATE',
    entity: 'LEAD',
    recordId: String(newLead.id),
    newValue: newLead,
    ipAddress
  });

  return newLead;
};

export const updateLead = async (id, data, user, ipAddress) => {
  const leadId = Number(id);
  const existing = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!existing) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && existing.assignedToId !== user.id && existing.createdById !== user.id) {
    const error = new Error('Access denied to modify this lead');
    error.statusCode = 403;
    throw error;
  }

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      name: data.name !== undefined ? data.name.trim() : existing.name,
      email: data.email !== undefined ? data.email.toLowerCase().trim() : existing.email,
      phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
      companyName: data.companyName !== undefined ? data.companyName.trim() : existing.companyName,
      source: data.source !== undefined ? data.source : existing.source,
      status: data.status !== undefined ? data.status : existing.status,
      estimatedValue: data.estimatedValue !== undefined ? Number(data.estimatedValue) : existing.estimatedValue,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
      assignedToId: data.assignedToId !== undefined ? (data.assignedToId ? Number(data.assignedToId) : null) : existing.assignedToId
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: data.status && data.status !== existing.status ? 'STATUS_CHANGE' : 'UPDATE',
    entity: 'LEAD',
    recordId: String(leadId),
    oldValue: existing,
    newValue: updatedLead,
    ipAddress
  });

  return updatedLead;
};

export const deleteLead = async (id, user, ipAddress) => {
  const leadId = Number(id);
  const existing = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!existing) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE') {
    const error = new Error('Sales Executives cannot delete leads');
    error.statusCode = 403;
    throw error;
  }

  await prisma.lead.delete({
    where: { id: leadId }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'DELETE',
    entity: 'LEAD',
    recordId: String(leadId),
    oldValue: existing,
    ipAddress
  });

  return true;
};

/**
 * Lead Conversion Workflow:
 * Converts Lead -> Customer + Opportunity
 */
export const convertLead = async (id, conversionData, user, ipAddress) => {
  const leadId = Number(id);
  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!lead) {
    const error = new Error('Lead not found');
    error.statusCode = 404;
    throw error;
  }

  if (lead.status === 'CONVERTED') {
    const error = new Error('This lead has already been converted');
    error.statusCode = 400;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && lead.assignedToId !== user.id && lead.createdById !== user.id) {
    const error = new Error('Access denied to convert this lead');
    error.statusCode = 403;
    throw error;
  }

  // Transaction for atomic conversion
  const result = await prisma.$transaction(async (tx) => {
    // 1. Check if Customer with same email already exists
    let customer = await tx.customer.findUnique({
      where: { email: lead.email }
    });

    if (!customer) {
      const custCount = await tx.customer.count();
      const customerCode = generateCode('CUST', custCount);
      customer = await tx.customer.create({
        data: {
          customerCode,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          companyName: lead.companyName,
          status: 'ACTIVE',
          createdById: user.id,
          assignedToId: lead.assignedToId || user.id
        }
      });
    }

    // 2. Create Opportunity
    const oppCount = await tx.opportunity.count();
    const opportunityCode = generateCode('OPP', oppCount);
    const opportunity = await tx.opportunity.create({
      data: {
        opportunityCode,
        name: conversionData.opportunityName || `${lead.companyName} - Deal`,
        customerId: customer.id,
        leadId: lead.id,
        amount: Number(conversionData.amount) || Number(lead.estimatedValue) || 1000,
        stage: conversionData.stage || 'QUALIFICATION',
        probability: conversionData.probability !== undefined ? Number(conversionData.probability) : 25,
        expectedCloseDate: new Date(conversionData.expectedCloseDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'OPEN',
        notes: conversionData.notes || `Converted from Lead ${lead.leadCode}`,
        createdById: user.id,
        assignedToId: lead.assignedToId || user.id
      }
    });

    // 3. Update Lead to CONVERTED
    const updatedLead = await tx.lead.update({
      where: { id: lead.id },
      data: {
        status: 'CONVERTED',
        convertedCustomerId: customer.id
      }
    });

    // 4. Re-link follow-ups and activities from lead to customer
    await tx.followUp.updateMany({
      where: { leadId: lead.id, customerId: null },
      data: { customerId: customer.id }
    });

    await tx.activity.updateMany({
      where: { leadId: lead.id, customerId: null },
      data: { customerId: customer.id }
    });

    return { customer, opportunity, lead: updatedLead };
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'CONVERT_LEAD',
    entity: 'LEAD',
    recordId: String(leadId),
    oldValue: { status: lead.status },
    newValue: {
      status: 'CONVERTED',
      customerId: result.customer.id,
      customerCode: result.customer.customerCode,
      opportunityId: result.opportunity.id,
      opportunityCode: result.opportunity.opportunityCode
    },
    ipAddress
  });

  return result;
};
