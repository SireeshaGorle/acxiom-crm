import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../../services/customerService.js';
import { SearchFilterBar } from '../../components/common/SearchFilterBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { CustomerFormModal } from './CustomerFormModal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/formatters.js';

export const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { hasRole } = useAuth();
  const canDelete = hasRole('ADMIN', 'MANAGER');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await customerService.getCustomers({
        page,
        limit,
        search,
        status
      });
      setCustomers(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSaveCustomer = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedCustomer) {
        await customerService.updateCustomer(selectedCustomer.id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      setIsFormOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      setActionLoading(true);
      await customerService.deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to delete customer.');
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
          <h4 className="fw-bold mb-0">Customer Management</h4>
          <p className="text-muted small mb-0">View, create, and manage enterprise client accounts.</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Main Table Card */}
      <div className="card-custom p-3 p-md-4">
        <SearchFilterBar
          searchPlaceholder="Search by name, email, company, code..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          filterOptions={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' }
          ]}
          filterValue={status}
          onFilterChange={(val) => { setStatus(val); setPage(1); }}
          filterLabel="All Statuses"
          onAddNew={() => { setSelectedCustomer(null); setIsFormOpen(true); }}
          addButtonLabel="Add Customer"
        />

        {loading ? (
          <LoadingSpinner message="Loading customer accounts..." />
        ) : customers.length === 0 ? (
          <EmptyState
            icon="bi-buildings"
            title="No customers found"
            description={search || status ? 'No customers matched your filter criteria.' : 'Start by adding your first enterprise client.'}
            actionLabel="Add Customer"
            onAction={() => { setSelectedCustomer(null); setIsFormOpen(true); }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Customer / Company</th>
                  <th>Contact Info</th>
                  <th>Location</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="badge bg-light text-primary border fw-bold">{c.customerCode}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">
                        <Link to={`/customers/${c.id}`} className="text-decoration-none text-dark hover-primary">
                          {c.name}
                        </Link>
                      </div>
                      <div className="text-muted small">{c.companyName}</div>
                    </td>
                    <td>
                      <div className="small text-dark">{c.email}</div>
                      <div className="text-muted small">{c.phone}</div>
                    </td>
                    <td>
                      <span className="small text-dark">{c.city ? `${c.city}, ${c.state || ''}` : '—'}</span>
                    </td>
                    <td>
                      <span className="small text-muted">
                        {c.assignedTo ? `${c.assignedTo.firstName} ${c.assignedTo.lastName}` : 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <Badge status={c.status} />
                    </td>
                    <td>
                      <span className="small text-muted">{formatDate(c.createdAt)}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/customers/${c.id}`} className="btn btn-outline-secondary" title="View Customer">
                          <i className="bi bi-eye"></i>
                        </Link>
                        <button
                          className="btn btn-outline-primary"
                          title="Edit Customer"
                          onClick={() => { setSelectedCustomer(c); setIsFormOpen(true); }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {canDelete && (
                          <button
                            className="btn btn-outline-danger"
                            title="Delete Customer"
                            onClick={() => setCustomerToDelete(c)}
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

      {/* Customer Create/Edit Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedCustomer(null); }}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete customer "${customerToDelete?.name}" (${customerToDelete?.companyName})? All associated opportunities and follow-ups will also be removed.`}
        confirmText="Delete Customer"
        loading={actionLoading}
      />
    </div>
  );
};
