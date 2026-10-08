import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { activityService } from '../../services/activityService.js';
import { SearchFilterBar } from '../../components/common/SearchFilterBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { ActivityFormModal } from './ActivityFormModal.jsx';
import { formatDate } from '../../utils/formatters.js';
import { ACTIVITY_TYPES, ACTIVITY_STATUSES } from '../../utils/constants.js';

export const ActivityListPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await activityService.getActivities({
        page,
        limit,
        search,
        type,
        status
      });
      setActivities(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch activities.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, type, status]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleSaveActivity = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedActivity) {
        await activityService.updateActivity(selectedActivity.id, formData);
      } else {
        await activityService.createActivity(formData);
      }
      setIsFormOpen(false);
      setSelectedActivity(null);
      fetchActivities();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      await activityService.deleteActivity(itemToDelete.id);
      setItemToDelete(null);
      fetchActivities();
    } catch (err) {
      setError(err.message || 'Failed to delete activity.');
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
          <h4 className="fw-bold mb-0">Activity Log & History</h4>
          <p className="text-muted small mb-0">Track all customer calls, emails, demos, and interactions.</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Main Table Card */}
      <div className="card-custom p-3 p-md-4">
        <SearchFilterBar
          searchPlaceholder="Search activities by subject, notes, customer..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          filterOptions={ACTIVITY_STATUSES}
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
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          }
          onAddNew={() => { setSelectedActivity(null); setIsFormOpen(true); }}
          addButtonLabel="Log Activity"
        />

        {loading ? (
          <LoadingSpinner message="Loading sales activities..." />
        ) : activities.length === 0 ? (
          <EmptyState
            icon="bi-activity"
            title="No activities recorded"
            description="Log your daily calls, emails, and meetings to keep customer history up to date."
            actionLabel="Log Activity"
            onAction={() => { setSelectedActivity(null); setIsFormOpen(true); }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Subject & Summary</th>
                  <th>Related Record</th>
                  <th>Date</th>
                  <th>Logged By</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                        <i className={`bi ${ACTIVITY_TYPES.find(t => t.value === a.type)?.icon || 'bi-activity'}`}></i>
                        {a.type}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{a.subject}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '320px' }}>
                        {a.description || 'No extra notes'}
                      </div>
                    </td>
                    <td>
                      {a.customer ? (
                        <div>
                          <Link to={`/customers/${a.customer.id}`} className="fw-medium text-dark text-decoration-none">
                            {a.customer.name}
                          </Link>
                          <div className="text-muted small">Account: {a.customer.companyName}</div>
                        </div>
                      ) : a.lead ? (
                        <div>
                          <Link to={`/leads/${a.lead.id}`} className="fw-medium text-dark text-decoration-none">
                            {a.lead.name}
                          </Link>
                          <div className="text-muted small">Lead: {a.lead.companyName}</div>
                        </div>
                      ) : (
                        <span className="text-muted small">General</span>
                      )}
                    </td>
                    <td>
                      <span className="small text-dark">{formatDate(a.activityDate)}</span>
                    </td>
                    <td>
                      <span className="small text-muted">
                        {a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <Badge status={a.status} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          title="Edit Activity"
                          onClick={() => { setSelectedActivity(a); setIsFormOpen(true); }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Delete Activity"
                          onClick={() => setItemToDelete(a)}
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

      {/* Activity Form Modal */}
      <ActivityFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedActivity(null); }}
        onSave={handleSaveActivity}
        activity={selectedActivity}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Activity"
        message="Are you sure you want to delete this activity log record?"
        confirmText="Delete"
        loading={actionLoading}
      />
    </div>
  );
};
