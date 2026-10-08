import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService.js';
import { StatCard } from '../../components/common/StatCard.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { LeadStatusChart } from '../../components/charts/LeadStatusChart.jsx';
import { OpportunityPipelineChart } from '../../components/charts/OpportunityPipelineChart.jsx';
import { MonthlySalesChart } from '../../components/charts/MonthlySalesChart.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { formatCurrency, formatDateTime } from '../../utils/formatters.js';
import { useAuth } from '../../hooks/useAuth.js';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await dashboardService.getDashboardData();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating real-time CRM analytics..." />;
  if (error) return <ErrorAlert message={error} onClose={fetchDashboard} />;
  if (!data) return null;

  const { kpis, charts, recentActivities, upcomingFollowUps } = data;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Executive Dashboard</h4>
          <p className="text-muted small mb-0">
            Welcome back, <strong className="text-dark">{user?.firstName}</strong>. Here is your live business overview.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button onClick={fetchDashboard} className="btn btn-sm btn-light border d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <Link to="/leads" className="btn btn-sm btn-primary-custom d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-lg"></i> New Lead
          </Link>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Customers"
            value={kpis.totalCustomers}
            icon="bi-buildings"
            color="primary"
            subtitle="Active enterprise accounts"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Leads"
            value={kpis.totalLeads}
            icon="bi-person-lines-fill"
            color="info"
            subtitle={`${kpis.openLeadsCount} active / qualified`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(kpis.totalPipelineValue)}
            icon="bi-cash-stack"
            color="warning"
            subtitle="Active unclosed deals"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Weighted Pipeline"
            value={formatCurrency(kpis.weightedPipelineValue)}
            icon="bi-graph-up-arrow"
            color="success"
            subtitle="Probability adjusted value"
          />
        </div>
      </div>

      {/* KPI Cards Row 2 */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card-custom p-3 text-center">
            <div className="text-muted small fw-semibold text-uppercase">Won Deals</div>
            <div className="fs-4 fw-bold text-success mt-1">{kpis.wonOpportunitiesCount}</div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{formatCurrency(kpis.totalWonRevenue)}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom p-3 text-center">
            <div className="text-muted small fw-semibold text-uppercase">Open Deals</div>
            <div className="fs-4 fw-bold text-primary mt-1">{kpis.openOpportunitiesCount}</div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>In qualification/negotiation</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom p-3 text-center">
            <div className="text-muted small fw-semibold text-uppercase">Lost Deals</div>
            <div className="fs-4 fw-bold text-danger mt-1">{kpis.lostOpportunitiesCount}</div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Closed lost opportunities</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card-custom p-3 text-center">
            <div className="text-muted small fw-semibold text-uppercase">Pending Follow-Ups</div>
            <div className="fs-4 fw-bold text-warning mt-1">{kpis.pendingFollowUpsCount}</div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Scheduled calls / tasks</div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="row g-4 mb-4">
        {/* Lead Status Breakdown */}
        <div className="col-12 col-lg-4">
          <div className="card-custom p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Lead Status Breakdown</h6>
              <span className="badge bg-light text-muted border">Live DB</span>
            </div>
            <LeadStatusChart chartData={charts.leadStatus} />
          </div>
        </div>

        {/* Opportunity Pipeline Stages */}
        <div className="col-12 col-lg-4">
          <div className="card-custom p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Opportunity Pipeline</h6>
              <span className="badge bg-light text-muted border">By Stage</span>
            </div>
            <OpportunityPipelineChart chartData={charts.opportunityPipeline} />
          </div>
        </div>

        {/* Monthly Sales Performance */}
        <div className="col-12 col-lg-4">
          <div className="card-custom p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Monthly Revenue Trend</h6>
              <span className="badge bg-light text-muted border">Last 6 Months</span>
            </div>
            <MonthlySalesChart chartData={charts.monthlySales} />
          </div>
        </div>
      </div>

      {/* Recent Activities & Upcoming Follow-Ups Row */}
      <div className="row g-4">
        {/* Upcoming Follow-Ups */}
        <div className="col-12 col-lg-6">
          <div className="card-custom p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-calendar-event text-primary me-2"></i>Upcoming Follow-Ups
              </h6>
              <Link to="/followups" className="small text-primary text-decoration-none fw-semibold">
                View All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {upcomingFollowUps.length === 0 ? (
              <p className="text-muted small text-center py-4 mb-0">No upcoming follow-ups scheduled.</p>
            ) : (
              <div className="list-group list-group-flush">
                {upcomingFollowUps.map((f) => (
                  <div key={f.id} className="list-group-item px-0 py-2 border-bottom d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold small text-dark">
                        {f.customer?.name || f.lead?.name || 'Contact'} ({f.type})
                      </div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                        {f.remarks}
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-light text-dark border small">
                        {formatDateTime(f.followUpDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-12 col-lg-6">
          <div className="card-custom p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-activity text-info me-2"></i>Recent Activities
              </h6>
              <Link to="/activities" className="small text-primary text-decoration-none fw-semibold">
                View All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <p className="text-muted small text-center py-4 mb-0">No recent activities logged.</p>
            ) : (
              <div className="list-group list-group-flush">
                {recentActivities.map((a) => (
                  <div key={a.id} className="list-group-item px-0 py-2 border-bottom d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-semibold small text-dark">
                        {a.subject}
                      </div>
                      <div className="text-muted small">
                        {a.customer?.name || a.lead?.name || 'General'} &bull; Logged by {a.assignedTo?.firstName || 'User'}
                      </div>
                    </div>
                    <div className="text-end">
                      <Badge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
