import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { opportunityService } from '../../services/opportunityService.js';
import { SearchFilterBar } from '../../components/common/SearchFilterBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { OpportunityFormModal } from './OpportunityFormModal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { OPPORTUNITY_STAGES, OPPORTUNITY_STATUSES } from '../../utils/constants.js';

export const OpportunityListPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [oppToDelete, setOppToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { hasRole } = useAuth();
  const canDelete = hasRole('ADMIN', 'MANAGER');

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await opportunityService.getOpportunities({
        page,
        limit,
        search,
        stage,
        status
      });
      setOpportunities(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch opportunities.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, stage, status]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleSaveOpp = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedOpp) {
        await opportunityService.updateOpportunity(selectedOpp.id, formData);
      } else {
        await opportunityService.createOpportunity(formData);
      }
      setIsFormOpen(false);
      setSelectedOpp(null);
      fetchOpportunities();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOpp = async () => {
    if (!oppToDelete) return;
    try {
      setActionLoading(true);
      await opportunityService.deleteOpportunity(oppToDelete.id);
      setOppToDelete(null);
      fetchOpportunities();
    } catch (err) {
      setError(err.message || 'Failed to delete opportunity.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-0">Sales Opportunities</h4>
          <p className="text-muted small mb-0">Pipeline deals, revenue projections, and contract negotiations.</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Main Table Card */}
      <div className="card-custom p-3 p-md-4">
        <SearchFilterBar
          searchPlaceholder="Search opportunities by name, code, customer..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          filterOptions={OPPORTUNITY_STAGES}
          filterValue={stage}
          onFilterChange={(val) => { setStage(val); setPage(1); }}
          filterLabel="All Stages"
          extraFilters={
            <select
              className="form-select form-select-sm form-select-custom"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {OPPORTUNITY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          }
          onAddNew={() => { setSelectedOpp(null); setIsFormOpen(true); }}
          addButtonLabel="Add Opportunity"
        />

        {loading ? (
          <LoadingSpinner message="Loading sales opportunities..." />
        ) : opportunities.length === 0 ? (
          <EmptyState
            icon="bi-cash-coin"
            title="No opportunities found"
            description={search || stage || status ? 'No opportunities match your filter criteria.' : 'Create a new opportunity to track potential revenue.'}
            actionLabel="Add Opportunity"
            onAction={() => { setSelectedOpp(null); setIsFormOpen(true); }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Opportunity Name</th>
                  <th>Customer Account</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Prob %</th>
                  <th>Weighted Value</th>
                  <th>Close Date</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <span className="badge bg-light text-primary border fw-bold">{opp.opportunityCode}</span>
                    </td>
                    <td>
                      <Link to={`/opportunities/${opp.id}`} className="fw-semibold text-dark text-decoration-none hover-primary">
                        {opp.name}
                      </Link>
                    </td>
                    <td>
                      <div className="small text-dark fw-medium">
                        {opp.customer ? (
                          <Link to={`/customers/${opp.customer.id}`} className="text-decoration-none text-secondary">
                            {opp.customer.name}
                          </Link>
                        ) : '—'}
                      </div>
                      <div className="text-muted small">{opp.customer?.companyName}</div>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{formatCurrency(opp.amount)}</span>
                    </td>
                    <td>
                      <Badge status={opp.stage} />
                    </td>
                    <td>
                      <span className="small fw-semibold">{opp.probability}%</span>
                    </td>
                    <td>
                      <span className="small fw-bold text-success">{formatCurrency(opp.weightedValue)}</span>
                    </td>
                    <td>
                      <span className="small text-muted">{formatDate(opp.expectedCloseDate)}</span>
                    </td>
                    <td>
                      <Badge status={opp.status} />
                    </td>
                    <td>
                      <span className="small text-muted">
                        {opp.assignedTo ? `${opp.assignedTo.firstName} ${opp.assignedTo.lastName}` : 'Unassigned'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/opportunities/${opp.id}`} className="btn btn-outline-secondary" title="View Opportunity">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-outline-primary"
                          title="Edit Opportunity"
                          onClick={() => { setSelectedOpp(opp); setIsFormOpen(true); }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {canDelete && (
                          <button
                            className="btn btn-outline-danger"
                            title="Delete Opportunity"
                            onClick={() => setOppToDelete(opp)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Opportunity Modal */}
      <OpportunityFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedOpp(null); }}
        onSave={handleSaveOpp}
        opportunity={selectedOpp}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!oppToDelete}
        onClose={() => setOppToDelete(null)}
        onConfirm={handleDeleteOpp}
        title="Delete Opportunity"
        message={`Are you sure you want to delete opportunity "${oppToDelete?.name}" (${formatCurrency(oppToDelete?.amount)})?`}
        confirmText="Delete Opportunity"
        loading={actionLoading}
      />
    </div>
  );
};
