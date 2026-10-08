import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService.js';
import { SearchFilterBar } from '../../components/common/SearchFilterBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { UserFormModal } from './UserFormModal.jsx';
import { PasswordResetModal } from './PasswordResetModal.jsx';
import { formatDate } from '../../utils/formatters.js';

export const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToReset, setUserToReset] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await userService.getUsers({
        page,
        limit,
        search,
        roleId,
        isActive
      });
      setUsers(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleId, isActive]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await userService.getRoles();
        if (res.data) setRoles(res.data);
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSaveUser = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedUser) {
        await userService.updateUser(selectedUser.id, formData);
        setSuccess('User profile updated successfully.');
      } else {
        await userService.createUser(formData);
        setSuccess('User account created successfully.');
      }
      setIsFormOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      setActionLoading(true);
      const res = await userService.toggleUserStatus(user.id);
      setSuccess(res.message || 'User status updated');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to change user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    if (!userToReset) return;
    try {
      setActionLoading(true);
      await userService.resetUserPassword(userToReset.id, newPassword);
      setSuccess(`Password for ${userToReset.firstName} reset successfully.`);
      setUserToReset(null);
      fetchUsers();
    } catch (err) {
      throw err;
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
          <h4 className="fw-bold mb-0">Users & Role Access</h4>
          <p className="text-muted small mb-0">System administration, team access rights, and credential management.</p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div className="flex-grow-1">{success}</div>
          <button type="button" className="btn-close py-2" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Main Table Card */}
      <div className="card-custom p-3 p-md-4">
        <SearchFilterBar
          searchPlaceholder="Search by name, email..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          filterOptions={roles.map(r => ({ value: r.id, label: r.name }))}
          filterValue={roleId}
          onFilterChange={(val) => { setRoleId(val); setPage(1); }}
          filterLabel="All Roles"
          extraFilters={
            <select
              className="form-select form-select-sm form-select-custom"
              value={isActive}
              onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Deactivated</option>
            </select>
          }
          onAddNew={() => { setSelectedUser(null); setIsFormOpen(true); }}
          addButtonLabel="Add User"
        />

        {loading ? (
          <LoadingSpinner message="Loading user accounts..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon="bi-people"
            title="No users found"
            description="No users matched your filter criteria."
            actionLabel="Add User"
            onAction={() => { setSelectedUser(null); setIsFormOpen(true); }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Assigned Records</th>
                  <th>Joined Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold small"
                          style={{ width: '32px', height: '32px' }}
                        >
                          {u.firstName?.[0]}
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{u.firstName} {u.lastName}</div>
                          <div className="text-muted small">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="small text-dark">{u.phone || '—'}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.role?.name === 'ADMIN' ? 'bg-danger' : u.role?.name === 'MANAGER' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                        {u.role?.name}
                      </span>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Deactivated</span>
                      )}
                    </td>
                    <td>
                      <span className="small text-muted">
                        {u._count?.assignedCustomers || 0} cust, {u._count?.assignedLeads || 0} leads, {u._count?.assignedOpportunities || 0} deals
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted">{formatDate(u.createdAt)}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          title="Edit User"
                          onClick={() => { setSelectedUser(u); setIsFormOpen(true); }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-warning text-dark"
                          title="Reset Password"
                          onClick={() => setUserToReset(u)}
                        >
                          <i className="bi bi-key"></i>
                        </button>
                        <button
                          className={`btn ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                          onClick={() => handleToggleStatus(u)}
                        >
                          <i className={`bi ${u.isActive ? 'bi-person-slash' : 'bi-person-check'}`}></i>
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

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedUser(null); }}
        onSave={handleSaveUser}
        user={selectedUser}
        loading={actionLoading}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={!!userToReset}
        onClose={() => setUserToReset(null)}
        onReset={handleResetPassword}
        user={userToReset}
        loading={actionLoading}
      />
    </div>
  );
};
