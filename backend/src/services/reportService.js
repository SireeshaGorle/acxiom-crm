import prisma from '../config/prisma.js';
import { buildRoleBasedWhereClause } from '../middleware/rbac.js';

export const getCustomerReport = async ({ search, status, city, startDate, endDate, user, page = 1, limit = 50 }) => {
  let where = {};
  if (status) where.status = status;
  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } }
    ];
  }
  where = buildRoleBasedWhereClause(user, where);

  const [total, data] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { opportunities: true, followUps: true, activities: true } }
      }
    })
  ]);

  return { data, total, page, limit };
};

export const getLeadReport = async ({ search, status, source, startDate, endDate, user, page = 1, limit = 50 }) => {
  let where = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } }
    ];
  }
  where = buildRoleBasedWhereClause(user, where);

  const [total, data] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { firstName: true, lastName: true, email: true } }
      }
    })
  ]);

  return { data, total, page, limit };
};

export const getOpportunityReport = async ({ search, stage, status, startDate, endDate, user, page = 1, limit = 50 }) => {
  let where = {};
  if (stage) where.stage = stage;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { opportunityCode: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } }
    ];
  }
  where = buildRoleBasedWhereClause(user, where);

  const [total, opps] = await Promise.all([
    prisma.opportunity.count({ where }),
    prisma.opportunity.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { customerCode: true, name: true, companyName: true } },
        assignedTo: { select: { firstName: true, lastName: true, email: true } }
      }
    })
  ]);

  const data = opps.map(o => ({
    ...o,
    weightedValue: Number(((o.amount * o.probability) / 100).toFixed(2))
  }));

  return { data, total, page, limit };
};

export const getPipelineReport = async (user) => {
  const where = buildRoleBasedWhereClause(user, {});

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      customer: { select: { name: true, companyName: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    },
    orderBy: { expectedCloseDate: 'asc' }
  });

  const summary = {
    totalDeals: opportunities.length,
    openDeals: opportunities.filter(o => o.status === 'OPEN').length,
    wonDeals: opportunities.filter(o => o.status === 'WON').length,
    lostDeals: opportunities.filter(o => o.status === 'LOST').length,
    totalPipelineValue: opportunities.filter(o => o.status === 'OPEN').reduce((sum, o) => sum + o.amount, 0),
    weightedPipelineValue: opportunities.filter(o => o.status === 'OPEN').reduce((sum, o) => sum + (o.amount * o.probability / 100), 0),
    totalWonRevenue: opportunities.filter(o => o.status === 'WON').reduce((sum, o) => sum + o.amount, 0)
  };

  return {
    summary,
    opportunities: opportunities.map(o => ({
      ...o,
      weightedValue: Number(((o.amount * o.probability) / 100).toFixed(2))
    }))
  };
};

export const getConversionReport = async (user) => {
  const leadWhere = buildRoleBasedWhereClause(user, {});

  const [totalLeads, convertedLeads, lostLeads] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, status: 'CONVERTED' } }),
    prisma.lead.count({ where: { ...leadWhere, status: 'LOST' } })
  ]);

  const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(2)) : 0;

  // Breakdown by source
  const sources = ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EXHIBITION', 'SOCIAL_MEDIA', 'OTHER'];
  const sourceStats = await Promise.all(
    sources.map(async (source) => {
      const sourceTotal = await prisma.lead.count({ where: { ...leadWhere, source } });
      const sourceConverted = await prisma.lead.count({ where: { ...leadWhere, source, status: 'CONVERTED' } });
      return {
        source,
        total: sourceTotal,
        converted: sourceConverted,
        conversionRate: sourceTotal > 0 ? Number(((sourceConverted / sourceTotal) * 100).toFixed(2)) : 0
      };
    })
  );

  return {
    overview: {
      totalLeads,
      convertedLeads,
      lostLeads,
      conversionRate
    },
    bySource: sourceStats
  };
};

export const getUserActivityReport = async ({ userId, startDate, endDate }) => {
  const where = {};
  if (userId) where.assignedToId = Number(userId);
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [activities, followUps, wonOpps] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: { assignedTo: { select: { firstName: true, lastName: true } } },
      orderBy: { activityDate: 'desc' }
    }),
    prisma.followUp.findMany({
      where,
      include: { assignedTo: { select: { firstName: true, lastName: true } } },
      orderBy: { followUpDate: 'desc' }
    }),
    prisma.opportunity.findMany({
      where: { ...where, status: 'WON' },
      include: { assignedTo: { select: { firstName: true, lastName: true } } }
    })
  ]);

  return {
    totalActivities: activities.length,
    totalFollowUps: followUps.length,
    totalWonDeals: wonOpps.length,
    wonRevenue: wonOpps.reduce((sum, o) => sum + o.amount, 0),
    activities,
    followUps
  };
};

export const getAuditReport = async ({ page = 1, limit = 50, search, userEmail, action, entity, startDate, endDate }) => {
  const where = {};
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (userEmail) where.userEmail = { contains: userEmail, mode: 'insensitive' };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { userEmail: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
      { entity: { contains: search, mode: 'insensitive' } },
      { recordId: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [total, data] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, role: true } }
      }
    })
  ]);

  return { data, total, page, limit };
};
