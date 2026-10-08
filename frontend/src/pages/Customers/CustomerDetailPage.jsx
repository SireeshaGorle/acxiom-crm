import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../../services/customerService.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CustomerFormModal } from './CustomerFormModal.jsx';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.js';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('opportunities');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await customerService.getCustomerById(id);
      setCustomer(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load customer details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setActionLoading(true);
      await customerService.updateCustomer(id, formData);
      setIsEditOpen(false);
      fetchCustomerDetails();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching customer profile and records..." />;
  if (error) return <ErrorAlert message={error} onClose={fetchCustomerDetails} />;
  if (!customer) return null;

  const totalWon = customer.opportunities?.filter(o => o.status === 'WON').reduce((s, o) => s + o.amount, 0) || 0;

  return (
    <div>
      {/* Top Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/customers" className="btn btn-sm btn-outline-secondary py-0 px-2">
              <i className="bi bi-arrow-left"></i> Customers
            </Link>
            <span className="badge bg-light text-primary border fw-bold">{customer.customerCode}</span>
            <Badge status={customer.status} />
          </div>
          <h4 className="fw-bold mb-0">{customer.name}</h4>
          <p className="text-muted small mb-0">{customer.companyName}</p>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-pencil"></i> Edit Customer
          </button>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Contact Details</h6>
            <div className="mb-2 small">
              <span className="text-muted d-block">Email Address</span>
              <span className="fw-semibold text-dark">{customer.email}</span>
            </div>
            <div className="mb-2 small">
              <span className="text-muted d-block">Phone</span>
              <span className="fw-semibold text-dark">{customer.phone}</span>
            </div>
            <div className="small">
              <span className="text-muted d-block">Location</span>
              <span className="fw-semibold text-dark">
                {customer.address ? `${customer.address}, ` : ''}{customer.city || ''} {customer.state || ''}
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Account Assignment</h6>
            <div className="mb-2 small">
              <span className="text-muted d-block">Account Owner / Assigned To</span>
              <span className="fw-semibold text-dark">
                {customer.assignedTo ? `${customer.assignedTo.firstName} ${customer.assignedTo.lastName}` : 'Unassigned'}
              </span>
            </div>
            <div className="mb-2 small">
              <span className="text-muted d-block">Created By</span>
              <span className="fw-semibold text-dark">
                {customer.createdBy?.firstName} {customer.createdBy?.lastName}
              </span>
            </div>
            <div className="small">
              <span className="text-muted d-block">Customer Since</span>
              <span className="fw-semibold text-dark">{formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card-custom p-3 h-100">
            <h6 className="fw-bold small text-uppercase text-muted mb-3">Commercial Metrics</h6>
            <div className="row g-2 text-center">
              <div className="col-6">
                <div className="p-2 bg-light rounded-2">
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Total Deals</div>
                  <div className="fs-5 fw-bold text-dark">{customer.opportunities?.length || 0}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 bg-light rounded-2">
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Won Revenue</div>
                  <div className="fs-5 fw-bold text-success">{formatCurrency(totalWon)}</div>
                </div>
              </div>
            </div>
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
              Opportunities ({customer.opportunities?.length || 0})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'followups' ? 'active fw-bold text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('followups')}
            >
              Follow-Ups ({customer.followUps?.length || 0})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'activities' ? 'active fw-bold text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab('activities')}
            >
              Activities ({customer.activities?.length || 0})
            </button>
          </li>
        </ul>

        {/* Tab 1: Opportunities */}
        {activeTab === 'opportunities' && (
          <div>
            {!customer.opportunities?.length ? (
              <p className="text-muted small text-center py-4 mb-0">No opportunities linked to this customer.</p>
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
                    {customer.opportunities.map((opp) => (
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

        {/* Tab 2: Follow-Ups */}
        {activeTab === 'followups' && (
          <div>
            {!customer.followUps?.length ? (
              <p className="text-muted small text-center py-4 mb-0">No follow-ups recorded for this customer.</p>
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
                    {customer.followUps.map((f) => (
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

        {/* Tab 3: Activities */}
        {activeTab === 'activities' && (
          <div>
            {!customer.activities?.length ? (
              <p className="text-muted small text-center py-4 mb-0">No activities logged for this customer.</p>
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
                    {customer.activities.map((a) => (
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

      {/* Edit Modal */}
      <CustomerFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
        customer={customer}
        loading={actionLoading}
      />
    </div>
  );
};
