import prisma from '../config/prisma.js';
import { buildRoleBasedWhereClause } from '../middleware/rbac.js';

export const getDashboardAnalytics = async (user) => {
  const baseCustomerWhere = buildRoleBasedWhereClause(user, {});
  const baseLeadWhere = buildRoleBasedWhereClause(user, {});
  const baseOppWhere = buildRoleBasedWhereClause(user, {});
  const baseFollowUpWhere = buildRoleBasedWhereClause(user, {});
  const baseActivityWhere = buildRoleBasedWhereClause(user, {});

  // 1. KPI Counts
  const [
    totalCustomers,
    totalLeads,
    openLeadsCount,
    totalOpportunities,
    openOpportunitiesCount,
    wonOpportunitiesCount,
    lostOpportunitiesCount,
    pendingFollowUpsCount
  ] = await Promise.all([
    prisma.customer.count({ where: baseCustomerWhere }),
    prisma.lead.count({ where: baseLeadWhere }),
    prisma.lead.count({
      where: {
        ...baseLeadWhere,
        status: { in: ['NEW', 'CONTACTED', 'QUALIFIED'] }
      }
    }),
    prisma.opportunity.count({ where: baseOppWhere }),
    prisma.opportunity.count({
      where: {
        ...baseOppWhere,
        status: 'OPEN'
      }
    }),
    prisma.opportunity.count({
      where: {
        ...baseOppWhere,
        status: 'WON'
      }
    }),
    prisma.opportunity.count({
      where: {
        ...baseOppWhere,
        status: 'LOST'
      }
    }),
    prisma.followUp.count({
      where: {
        ...baseFollowUpWhere,
        status: 'PLANNED'
      }
    })
  ]);

  // 2. Opportunities pipeline calculation (Total Value & Weighted Value)
  const allOpportunities = await prisma.opportunity.findMany({
    where: baseOppWhere,
    select: { amount: true, probability: true, stage: true, status: true }
  });

  const totalPipelineValue = allOpportunities
    .filter(o => o.status === 'OPEN')
    .reduce((sum, opp) => sum + (opp.amount || 0), 0);

  const weightedPipelineValue = allOpportunities
    .filter(o => o.status === 'OPEN')
    .reduce((sum, opp) => sum + ((opp.amount || 0) * (opp.probability || 0) / 100), 0);

  const totalWonRevenue = allOpportunities
    .filter(o => o.status === 'WON')
    .reduce((sum, opp) => sum + (opp.amount || 0), 0);

  // 3. Lead Status Chart Data
  const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST'];
  const leadCountsByStatus = await Promise.all(
    leadStatuses.map(status =>
      prisma.lead.count({
        where: {
          ...baseLeadWhere,
          status
        }
      })
    )
  );

  // 4. Opportunity Pipeline by Stage Chart Data
  const stages = ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
  const stageStats = await Promise.all(
    stages.map(async (stage) => {
      const opps = await prisma.opportunity.findMany({
        where: {
          ...baseOppWhere,
          stage
        },
        select: { amount: true }
      });
      const count = opps.length;
      const totalAmount = opps.reduce((sum, o) => sum + (o.amount || 0), 0);
      return { stage, count, totalAmount };
    })
  );

  // 5. Monthly Sales Chart (Last 6 months won opportunities)
  const now = new Date();
  const months = [];
  const monthLabels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthName = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthLabels.push(monthName);
    months.push({ start: startOfMonth, end: endOfMonth });
  }

  const monthlySalesData = await Promise.all(
    months.map(async (m) => {
      const wonOpps = await prisma.opportunity.findMany({
        where: {
          ...baseOppWhere,
          status: 'WON',
          updatedAt: { gte: m.start, lte: m.end }
        },
        select: { amount: true }
      });
      return wonOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    })
  );

  // 6. Recent Activities
  const recentActivities = await prisma.activity.findMany({
    where: baseActivityWhere,
    take: 5,
    orderBy: { activityDate: 'desc' },
    include: {
      customer: { select: { name: true } },
      lead: { select: { name: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  // 7. Upcoming Follow-Ups
  const upcomingFollowUps = await prisma.followUp.findMany({
    where: {
      ...baseFollowUpWhere,
      status: 'PLANNED'
    },
    take: 5,
    orderBy: { followUpDate: 'asc' },
    include: {
      customer: { select: { name: true, phone: true } },
      lead: { select: { name: true, phone: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  return {
    kpis: {
      totalCustomers,
      totalLeads,
      openLeadsCount,
      totalOpportunities,
      openOpportunitiesCount,
      wonOpportunitiesCount,
      lostOpportunitiesCount,
      pendingFollowUpsCount,
      totalPipelineValue: Number(totalPipelineValue.toFixed(2)),
      weightedPipelineValue: Number(weightedPipelineValue.toFixed(2)),
      totalWonRevenue: Number(totalWonRevenue.toFixed(2))
    },
    charts: {
      leadStatus: {
        labels: leadStatuses.map(s => s.replace('_', ' ')),
        data: leadCountsByStatus
      },
      opportunityPipeline: {
        labels: stages.map(s => s.replace('_', ' ')),
        counts: stageStats.map(s => s.count),
        amounts: stageStats.map(s => Number(s.totalAmount.toFixed(2)))
      },
      monthlySales: {
        labels: monthLabels,
        data: monthlySalesData.map(v => Number(v.toFixed(2)))
      }
    },
    recentActivities,
    upcomingFollowUps
  };
};
