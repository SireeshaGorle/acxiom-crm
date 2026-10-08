import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { followUpService } from '../../services/followUpService.js';
import { SearchFilterBar } from '../../components/common/SearchFilterBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { FollowUpFormModal } from './FollowUpFormModal.jsx';
import { formatDateTime } from '../../utils/formatters.js';
import { FOLLOWUP_TYPES, FOLLOWUP_STATUSES } from '../../utils/constants.js';

export const FollowUpListPage = () => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [filterTime, setFilterTime] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await followUpService.getFollowUps({
        page,
        limit,
        search,
        type,
        status,
        filterTime
      });
      setFollowUps(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch follow-ups.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, type, status, filterTime]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const handleSaveFollowUp = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedFollowUp) {
        await followUpService.updateFollowUp(selectedFollowUp.id, formData);
      } else {
        await followUpService.createFollowUp(formData);
      }
      setIsFormOpen(false);
      setSelectedFollowUp(null);
      fetchFollowUps();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickStatus = async (followUp, newStatus) => {
    try {
      setActionLoading(true);
      await followUpService.updateFollowUp(followUp.id, { status: newStatus });
      fetchFollowUps();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      await followUpService.deleteFollowUp(itemToDelete.id);
      setItemToDelete(null);
      fetchFollowUps();
    } catch (err) {
      setError(err.message || 'Failed to delete follow-up.');
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
          <h4 className="fw-bold mb-0">Follow-Up Tasks</h4>
          <p className="text-muted small mb-0">Schedule and monitor client touchpoints, calls, and meetings.</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Quick Timeframe Filter Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          className={`btn btn-sm ${filterTime === '' ? 'btn-primary' : 'btn-light border'}`}
          onClick={() => { setFilterTime(''); setPage(1); }}
        >
          All Follow-Ups
        </button>
        <button
          className={`btn btn-sm ${filterTime === 'today' ? 'btn-primary' : 'btn-light border'}`}
          onClick={() => { setFilterTime('today'); setPage(1); }}
        >
          <i className="bi bi-calendar2-day me-1"></i> Today's Schedule
        </button>
        <button
          className={`btn btn-sm ${filterTime === 'upcoming' ? 'btn-primary' : 'btn-light border'}`}
          onClick={() => { setFilterTime('upcoming'); setPage(1); }}
        >
          <i className="bi bi-calendar-event me-1"></i> Upcoming
        </button>
        <button
          className={`btn btn-sm ${filterTime === 'overdue' ? 'btn-danger' : 'btn-light border text-danger'}`}
          onClick={() => { setFilterTime('overdue'); setPage(1); }}
        >
          <i className="bi bi-exclamation-circle me-1"></i> Overdue Tasks
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card-custom p-3 p-md-4">
        <SearchFilterBar
          searchPlaceholder="Search follow-ups by agenda, remarks, customer..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          filterOptions={FOLLOWUP_STATUSES}
          filterValue={status}
          onFilterChange={(val) => { setStatus(val); setPage(1); }}
          filterLabel="All Statuses"
          extraFilters={
            <select
              className="form-select form-select-sm form-select-custom"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              {FOLLOWUP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          }
          onAddNew={() => { setSelectedFollowUp(null); setIsFormOpen(true); }}
          addButtonLabel="Schedule Follow-Up"
        />

        {loading ? (
          <LoadingSpinner message="Loading follow-up agenda..." />
        ) : followUps.length === 0 ? (
          <EmptyState
            icon="bi-calendar-check"
            title="No follow-ups found"
            description="You have no scheduled calls or meetings matching your filters."
            actionLabel="Schedule Follow-Up"
            onAction={() => { setSelectedFollowUp(null); setIsFormOpen(true); }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Contact / Association</th>
                  <th>Agenda / Remarks</th>
                  <th>Scheduled Date & Time</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                        <i className={`bi ${FOLLOWUP_TYPES.find(t => t.value === f.type)?.icon || 'bi-calendar'}`}></i>
                        {f.type}
                      </span>
                    </td>
                    <td>
                      {f.customer ? (
                        <div>
                          <Link to={`/customers/${f.customer.id}`} className="fw-semibold text-dark text-decoration-none">
                            {f.customer.name}
                          </Link>
                          <div className="text-muted small">Account: {f.customer.companyName}</div>
                        </div>
                      ) : f.lead ? (
                        <div>
                          <Link to={`/leads/${f.lead.id}`} className="fw-semibold text-dark text-decoration-none">
                            {f.lead.name}
                          </Link>
                          <div className="text-muted small">Lead: {f.lead.companyName}</div>
                        </div>
                      ) : (
                        <span className="text-muted small">Direct Task</span>
                      )}
                    </td>
                    <td>
                      <div className="small text-dark" style={{ maxWidth: '280px' }}>{f.remarks}</div>
                    </td>
                    <td>
                      <span className="small fw-medium text-dark">{formatDateTime(f.followUpDate)}</span>
                    </td>
                    <td>
                      <span className="small text-muted">
                        {f.assignedTo ? `${f.assignedTo.firstName} ${f.assignedTo.lastName}` : 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <Badge status={f.status} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {f.status === 'PLANNED' && (
                          <button
                            className="btn btn-outline-success"
                            title="Mark Completed"
                            onClick={() => handleQuickStatus(f, 'COMPLETED')}
                          >
                            <i className="bi bi-check2"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-outline-primary"
                          title="Edit Task"
                          onClick={() => { setSelectedFollowUp(f); setIsFormOpen(true); }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Delete Follow-Up"
                          onClick={() => setItemToDelete(f)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
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

      {/* Follow-Up Form Modal */}
      <FollowUpFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedFollowUp(null); }}
        onSave={handleSaveFollowUp}
        followUp={selectedFollowUp}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Follow-Up"
        message="Are you sure you want to remove this follow-up schedule?"
        confirmText="Delete"
        loading={actionLoading}
      />
    </div>
  );
};
