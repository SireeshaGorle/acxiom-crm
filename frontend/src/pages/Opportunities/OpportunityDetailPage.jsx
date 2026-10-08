import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { opportunityService } from '../../services/opportunityService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { OpportunityFormModal } from './OpportunityFormModal.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOppDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await opportunityService.getOpportunityById(id);
      setOpp(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load opportunity details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOppDetails();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setActionLoading(true);
      await opportunityService.updateOpportunity(id, formData);
      setIsEditOpen(false);
      fetchOppDetails();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching opportunity details..." />;
  if (error) return <ErrorAlert message={error} onClose={fetchOppDetails} />;
  if (!opp) return null;

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/opportunities" className="btn btn-sm btn-outline-secondary py-0 px-2">
              <i className="bi bi-arrow-left"></i> Opportunities
            </Link>
            <span className="badge bg-light text-primary border fw-bold">{opp.opportunityCode}</span>
            <Badge status={opp.stage} />
            <Badge status={opp.status} />
          </div>
          <h4 className="fw-bold mb-0">{opp.name}</h4>
          <p className="text-muted small mb-0">
            Customer: <Link to={`/customers/${opp.customerId}`} className="fw-semibold text-decoration-none">{opp.customer?.name} ({opp.customer?.companyName})</Link>
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsEditOpen(true)}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-pencil"></i> Edit Opportunity
          </button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Financial Valuation</h6>
            <div className="mb-2">
              <span className="text-muted small d-block">Contract Value</span>
              <span className="fs-4 fw-bold text-dark">{formatCurrency(opp.amount)}</span>
            </div>
            <div className="mb-2">
              <span className="text-muted small d-block">Probability & Weighted Forecast</span>
              <span className="fs-5 fw-semibold text-success">
                {opp.probability}% &rarr; {formatCurrency(opp.weightedValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Deal Timeline & Owner</h6>
            <div className="mb-2 small">
              <span className="text-muted d-block">Expected Target Close Date</span>
              <span className="fw-semibold text-dark">{formatDate(opp.expectedCloseDate)}</span>
            </div>
            <div className="mb-2 small">
              <span className="text-muted d-block">Deal Owner</span>
              <span className="fw-semibold text-dark">
                {opp.assignedTo ? `${opp.assignedTo.firstName} ${opp.assignedTo.lastName}` : 'Unassigned'}
              </span>
            </div>
            <div className="small">
              <span className="text-muted d-block">Created On</span>
              <span className="fw-semibold text-dark">{formatDate(opp.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Origin & Commercial Notes</h6>
            {opp.lead && (
              <div className="mb-2 small">
                <span className="text-muted d-block">Converted Lead Source</span>
                <Link to={`/leads/${opp.lead.id}`} className="text-decoration-none fw-semibold">
                  {opp.lead.leadCode} - {opp.lead.name}
                </Link>
              </div>
            )}
            <p className="text-secondary small mb-0 fst-italic">
              {opp.notes || 'No specific commercial terms recorded.'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <OpportunityFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
        opportunity={opp}
        loading={actionLoading}
      />
    </div>
  );
};
