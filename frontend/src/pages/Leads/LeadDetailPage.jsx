import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { leadService } from '../../services/leadService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { LeadFormModal } from './LeadFormModal.jsx';
import { LeadConvertModal } from './LeadConvertModal.jsx';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.js';

export const LeadDetailPage = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('opportunities');

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await leadService.getLeadById(id);
      setLead(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setActionLoading(true);
      await leadService.updateLead(id, formData);
      setIsEditOpen(false);
      fetchLeadDetails();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async (conversionData) => {
    try {
      setActionLoading(true);
      await leadService.convertLead(id, conversionData);
      setIsConvertOpen(false);
      fetchLeadDetails();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching lead details..." />;
  if (error) return <ErrorAlert message={error} onClose={fetchLeadDetails} />;
  if (!lead) return null;

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/leads" className="btn btn-sm btn-outline-secondary py-0 px-2">
              <i className="bi bi-arrow-left"></i> Leads
            </Link>
            <span className="badge bg-light text-primary border fw-bold">{lead.leadCode}</span>
            <Badge status={lead.status} />
          </div>
          <h4 className="fw-bold mb-0">{lead.name}</h4>
          <p className="text-muted small mb-0">{lead.companyName}</p>
        </div>

        <div className="d-flex gap-2">
          {lead.status !== 'CONVERTED' ? (
            <button
              onClick={() => setIsConvertOpen(true)}
              className="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm"
            >
              <i className="bi bi-arrow-repeat"></i> Convert to Opportunity
            </button>
          ) : (
            lead.convertedCustomer && (
              <Link
                to={`/customers/${lead.convertedCustomer.id}`}
                className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
              >
                <i className="bi bi-box-arrow-up-right"></i> View Converted Account ({lead.convertedCustomer.customerCode})
              </Link>
            )
          )}
          <button
            onClick={() => setIsEditOpen(true)}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-pencil"></i> Edit Lead
          </button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Lead Contact Info</h6>
            <div className="mb-2 small">
              <span className="text-muted d-block">Email</span>
              <span className="fw-semibold text-dark">{lead.email}</span>
            </div>
            <div className="mb-2 small">
              <span className="text-muted d-block">Phone</span>
              <span className="fw-semibold text-dark">{lead.phone}</span>
            </div>
            <div className="small">
              <span className="text-muted d-block">Source Channel</span>
              <span className="badge bg-light text-secondary border">{lead.source}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Deal Estimate & Ownership</h6>
            <div className="mb-2 small">
              <span className="text-muted d-block">Estimated Deal Value</span>
              <span className="fs-5 fw-bold text-dark">{formatCurrency(lead.estimatedValue)}</span>
            </div>
            <div className="mb-2 small">
              <span className="text-muted d-block">Assigned Executive</span>
              <span className="fw-semibold text-dark">
                {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned'}
              </span>
            </div>
            <div className="small">
              <span className="text-muted d-block">Created On</span>
              <span className="fw-semibold text-dark">{formatDate(lead.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Discovery Notes</h6>
            <p className="text-secondary small mb-0 fst-italic">
              {lead.notes || 'No discovery notes added yet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-custom p-4">
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'opportunities' ? 'active fw-bold text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('opportunities')}
            >
              Opportunities ({lead.opportunities?.length || 0})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'followups' ? 'active fw-bold text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('followups')}
            >
              Follow-Ups ({lead.followUps?.length || 0})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'activities' ? 'active fw-bold text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('activities')}
            >
              Activities ({lead.activities?.length || 0})
            </button>
          </li>
        </ul>

        {activeTab === 'opportunities' && (
          <div>
            {!lead.opportunities?.length ? (
              <p className="text-muted small text-center py-4 mb-0">No opportunities generated from this lead.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom align-middle">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Opportunity Name</th>
                      <th>Amount</th>
                      <th>Stage</th>
                      <th>Prob %</th>
                      <th>Expected Close</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lead.opportunities.map((opp) => (
                      <tr key={opp.id}>
                        <td><span className="badge bg-light text-primary border">{opp.opportunityCode}</span></td>
                        <td><Link to={`/opportunities/${opp.id}`} className="fw-semibold text-dark text-decoration-none">{opp.name}</Link></td>
                        <td className="fw-bold">{formatCurrency(opp.amount)}</td>
                        <td><Badge status={opp.stage} /></td>
                        <td>{opp.probability}%</td>
                        <td>{formatDate(opp.expectedCloseDate)}</td>
                        <td><Badge status={opp.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'followups' && (
          <div>
            {!lead.followUps?.length ? (
              <p className="text-muted small text-center py-4 mb-0">No follow-ups recorded for this lead.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom align-middle">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Remarks</th>
                      <th>Follow-Up Date</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lead.followUps.map((f) => (
                      <tr key={f.id}>
                        <td><span className="badge bg-light text-dark border">{f.type}</span></td>
                        <td>{f.remarks}</td>
                        <td>{formatDateTime(f.followUpDate)}</td>
                        <td>{f.assignedTo ? `${f.assignedTo.firstName} ${f.assignedTo.lastName}` : '—'}</td>
                        <td><Badge status={f.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activities' && (
          <div>
            {!lead.activities?.length ? (
              <p className="text-muted small text-center py-4 mb-0">No activities logged for this lead.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom align-middle">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Subject</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lead.activities.map((a) => (
                      <tr key={a.id}>
                        <td><span className="badge bg-light text-dark border">{a.type}</span></td>
                        <td className="fw-semibold">{a.subject}</td>
                        <td className="text-muted small">{a.description || '—'}</td>
                        <td>{formatDate(a.activityDate)}</td>
                        <td><Badge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Lead Modal */}
      <LeadFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
        lead={lead}
        loading={actionLoading}
      />

      {/* Convert Lead Modal */}
      <LeadConvertModal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        onConvert={handleConvert}
        lead={lead}
        loading={actionLoading}
      />
    </div>
  );
};
