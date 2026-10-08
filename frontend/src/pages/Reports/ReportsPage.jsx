import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { exportToCSV } from '../../utils/exportToCsv.js';
import { useAuth } from '../../hooks/useAuth.js';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');

  const fetchReport = async (tab) => {
    try {
      setLoading(true);
      setError('');
      setData(null);

      if (tab === 'pipeline') {
        const res = await reportService.getPipelineReport();
        setData(res.data);
      } else if (tab === 'conversion') {
        const res = await reportService.getConversionReport();
        setData(res.data);
      } else if (tab === 'customers') {
        const res = await reportService.getCustomerReport({ limit: 100 });
        setData(res.data);
      } else if (tab === 'leads') {
        const res = await reportService.getLeadReport({ limit: 100 });
        setData(res.data);
      } else if (tab === 'opportunities') {
        const res = await reportService.getOpportunityReport({ limit: 100 });
        setData(res.data);
      } else if (tab === 'user-activity') {
        const res = await reportService.getUserActivityReport();
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const handleExportCSV = () => {
    if (!data) return;

    if (activeTab === 'pipeline' && data.opportunities) {
      const exportRows = data.opportunities.map(o => ({
        Code: o.opportunityCode,
        Name: o.name,
        Customer: o.customer?.name || '',
        Company: o.customer?.companyName || '',
        Amount: o.amount,
        Stage: o.stage,
        Probability: `${o.probability}%`,
        WeightedValue: o.weightedValue,
        ExpectedCloseDate: formatDate(o.expectedCloseDate),
        Status: o.status,
        Owner: o.assignedTo ? `${o.assignedTo.firstName} ${o.assignedTo.lastName}` : ''
      }));
      exportToCSV(exportRows, `Sales_Pipeline_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (activeTab === 'conversion' && data.bySource) {
      exportToCSV(data.bySource, `Lead_Conversion_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (Array.isArray(data)) {
      exportToCSV(data, `${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (data.data && Array.isArray(data.data)) {
      exportToCSV(data.data, `${activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-0">Business Reports & Analytics</h4>
          <p className="text-muted small mb-0">Exportable sales reports, conversion ratios, and executive analytics.</p>
        </div>
        <div>
          <button
            onClick={handleExportCSV}
            className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 shadow-sm"
            disabled={loading || !data}
          >
            <i className="bi bi-file-earmark-spreadsheet"></i> Export CSV
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Report Tabs */}
      <div className="card-custom p-4">
        <ul className="nav nav-pills mb-4 gap-1 border-bottom pb-3">
          <li className="nav-item">
            <button
              className={`nav-link btn-sm ${activeTab === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('pipeline')}
            >
              <i className="bi bi-graph-up-arrow me-1"></i> Sales Pipeline
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn-sm ${activeTab === 'conversion' ? 'active' : ''}`}
              onClick={() => setActiveTab('conversion')}
            >
              <i className="bi bi-funnel-fill me-1"></i> Lead Conversion
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn-sm ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <i className="bi bi-buildings me-1"></i> Customer Accounts
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn-sm ${activeTab === 'leads' ? 'active' : ''}`}
              onClick={() => setActiveTab('leads')}
            >
              <i className="bi bi-person-lines-fill me-1"></i> Lead Pipeline
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link btn-sm ${activeTab === 'opportunities' ? 'active' : ''}`}
              onClick={() => setActiveTab('opportunities')}
            >
              <i className="bi bi-cash-stack me-1"></i> Opportunities
            </button>
          </li>
          {isAdmin && (
            <li className="nav-item">
              <button
                className={`nav-link btn-sm ${activeTab === 'user-activity' ? 'active' : ''}`}
                onClick={() => setActiveTab('user-activity')}
              >
                <i className="bi bi-person-check-fill me-1"></i> Team Performance
              </button>
            </li>
          )}
        </ul>

        {loading ? (
          <LoadingSpinner message="Generating real-time CRM report..." />
        ) : (
          <div>
            {/* TAB 1: PIPELINE REPORT */}
            {activeTab === 'pipeline' && data && (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Total Pipeline Value</div>
                      <div className="fs-5 fw-bold text-primary">{formatCurrency(data.summary?.totalPipelineValue)}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Weighted Pipeline</div>
                      <div className="fs-5 fw-bold text-success">{formatCurrency(data.summary?.weightedPipelineValue)}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Closed Won Revenue</div>
                      <div className="fs-5 fw-bold text-dark">{formatCurrency(data.summary?.totalWonRevenue)}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Active Open Deals</div>
                      <div className="fs-5 fw-bold text-warning">{data.summary?.openDeals} deals</div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Opportunity</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Stage</th>
                        <th>Probability</th>
                        <th>Weighted Value</th>
                        <th>Expected Close</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.opportunities?.map((opp) => (
                        <tr key={opp.id}>
                          <td><span className="badge bg-light text-primary border">{opp.opportunityCode}</span></td>
                          <td className="fw-semibold">{opp.name}</td>
                          <td>{opp.customer?.name} ({opp.customer?.companyName})</td>
                          <td className="fw-bold">{formatCurrency(opp.amount)}</td>
                          <td><Badge status={opp.stage} /></td>
                          <td>{opp.probability}%</td>
                          <td className="fw-bold text-success">{formatCurrency(opp.weightedValue)}</td>
                          <td>{formatDate(opp.expectedCloseDate)}</td>
                          <td><Badge status={opp.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: CONVERSION REPORT */}
            {activeTab === 'conversion' && data && (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Total Leads Captured</div>
                      <div className="fs-4 fw-bold text-dark">{data.overview?.totalLeads}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Converted to Customers</div>
                      <div className="fs-4 fw-bold text-success">{data.overview?.convertedLeads}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Conversion Ratio</div>
                      <div className="fs-4 fw-bold text-primary">{data.overview?.conversionRate}%</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Lost Leads</div>
                      <div className="fs-4 fw-bold text-danger">{data.overview?.lostLeads}</div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Conversion Performance by Channel Source</h6>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Lead Source Channel</th>
                        <th>Total Leads</th>
                        <th>Converted Leads</th>
                        <th>Conversion Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bySource?.map((s) => (
                        <tr key={s.source}>
                          <td className="fw-semibold">{s.source}</td>
                          <td>{s.total}</td>
                          <td className="text-success fw-bold">{s.converted}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: `${s.conversionRate}%` }}
                                ></div>
                              </div>
                              <span className="small fw-semibold">{s.conversionRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOMER REPORT */}
            {activeTab === 'customers' && (
              <div className="table-responsive">
                <table className="table table-custom align-middle">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Customer Name</th>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(data) ? data : data?.data || []).map((c) => (
                      <tr key={c.id}>
                        <td><span className="badge bg-light text-primary border">{c.customerCode}</span></td>
                        <td className="fw-semibold">{c.name}</td>
                        <td>{c.companyName}</td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td>{c.city ? `${c.city}, ${c.state || ''}` : '—'}</td>
                        <td><Badge status={c.status} /></td>
                        <td>{formatDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 4: LEAD REPORT */}
            {activeTab === 'leads' && (
              <div className="table-responsive">
                <table className="table table-custom align-middle">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Lead Contact</th>
                      <th>Company</th>
                      <th>Source</th>
                      <th>Est Value</th>
                      <th>Status</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(data) ? data : data?.data || []).map((l) => (
                      <tr key={l.id}>
                        <td><span className="badge bg-light text-primary border">{l.leadCode}</span></td>
                        <td className="fw-semibold">{l.name}</td>
                        <td>{l.companyName}</td>
                        <td><span className="badge bg-light text-dark border">{l.source}</span></td>
                        <td className="fw-bold">{formatCurrency(l.estimatedValue)}</td>
                        <td><Badge status={l.status} /></td>
                        <td>{formatDate(l.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 5: OPPORTUNITY REPORT */}
            {activeTab === 'opportunities' && (
              <div className="table-responsive">
                <table className="table table-custom align-middle">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Opportunity Name</th>
                      <th>Customer</th>
                      <th>Deal Amount</th>
                      <th>Stage</th>
                      <th>Probability</th>
                      <th>Weighted Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(data) ? data : data?.data || []).map((o) => (
                      <tr key={o.id}>
                        <td><span className="badge bg-light text-primary border">{o.opportunityCode}</span></td>
                        <td className="fw-semibold">{o.name}</td>
                        <td>{o.customer?.companyName || o.customer?.name}</td>
                        <td className="fw-bold">{formatCurrency(o.amount)}</td>
                        <td><Badge status={o.stage} /></td>
                        <td>{o.probability}%</td>
                        <td className="fw-bold text-success">{formatCurrency(o.weightedValue)}</td>
                        <td><Badge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 6: USER ACTIVITY REPORT */}
            {activeTab === 'user-activity' && data && (
              <div>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Total Activities Logged</div>
                      <div className="fs-4 fw-bold text-primary">{data.totalActivities}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Follow-Ups Handled</div>
                      <div className="fs-4 fw-bold text-info">{data.totalFollowUps}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Won Deals Closed</div>
                      <div className="fs-4 fw-bold text-success">{data.totalWonDeals}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded text-center">
                      <div className="text-muted small">Won Deal Revenue</div>
                      <div className="fs-4 fw-bold text-success">{formatCurrency(data.wonRevenue)}</div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Logged Activity Stream</h6>
                <div className="table-responsive">
                  <table className="table table-custom align-middle">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Team Member</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.activities?.map((a) => (
                        <tr key={a.id}>
                          <td><span className="badge bg-light text-dark border">{a.type}</span></td>
                          <td className="fw-semibold">{a.subject}</td>
                          <td>{a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : 'Unassigned'}</td>
                          <td>{formatDate(a.activityDate)}</td>
                          <td><Badge status={a.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
