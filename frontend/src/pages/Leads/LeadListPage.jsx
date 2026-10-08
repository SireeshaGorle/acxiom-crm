import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { leadService } from '../../services/leadService.js';
import { SearchFilterBar } from '../../components/common/SearchFilterBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { LeadFormModal } from './LeadFormModal.jsx';
import { LeadConvertModal } from './LeadConvertModal.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants.js';

export const LeadListPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { hasRole } = useAuth();
  const canDelete = hasRole('ADMIN', 'MANAGER');

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await leadService.getLeads({
        page,
        limit,
        search,
        status,
        source
      });
      setLeads(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch leads.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, source]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSaveLead = async (formData) => {
    try {
      setActionLoading(true);
      if (selectedLead) {
        await leadService.updateLead(selectedLead.id, formData);
        setSuccessMessage('Lead updated successfully.');
      } else {
        await leadService.createLead(formData);
        setSuccessMessage('Lead created successfully.');
      }
      setIsFormOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertLead = async (conversionData) => {
    if (!leadToConvert) return;
    try {
      setActionLoading(true);
      const res = await leadService.convertLead(leadToConvert.id, conversionData);
      setLeadToConvert(null);
      setSuccessMessage(`Lead ${leadToConvert.leadCode} converted successfully into Customer ${res.data?.customer?.customerCode} & Opportunity ${res.data?.opportunity?.opportunityCode}!`);
      fetchLeads();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      setActionLoading(true);
      await leadService.deleteLead(leadToDelete.id);
      setLeadToDelete(null);
      setSuccessMessage('Lead deleted successfully.');
      fetchLeads();
    } catch (err) {
      setError(err.message || 'Failed to delete lead.');
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
          <h4 className="fw-bold mb-0">Lead Management</h4>
          <p className="text-muted small mb-0">Track prospective buyers, qualify leads, and convert them to revenue.</p>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div className="flex-grow-1">{successMessage}</div>
          <button type="button" className="btn-close py-2" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Main Table Card */}
      <div className="card-custom p-3 p-md-4">
        <SearchFilterBar
          searchPlaceholder="Search leads by name, email, company, code..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          filterOptions={LEAD_STATUSES}
          filterValue={status}
          onFilterChange={(val) => { setStatus(val); setPage(1); }}
          filterLabel="All Statuses"
          extraFilters={
            <select
              className="form-select form-select-sm form-select-custom"
              value={source}
              onChange={(e) => { setSource(e.target.value); setPage(1); }}
            >
              <option value="">All Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          }
          onAddNew={() => { setSelectedLead(null); setIsFormOpen(true); }}
          addButtonLabel="Add Lead"
        />

        {loading ? (
          <LoadingSpinner message="Loading sales leads..." />
        ) : leads.length === 0 ? (
          <EmptyState
            icon="bi-person-lines-fill"
            title="No leads found"
            description={search || status || source ? 'No leads match the specified filter criteria.' : 'Create your first prospective sales lead.'}
            actionLabel="Add Lead"
            onAction={() => { setSelectedLead(null); setIsFormOpen(true); }}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Lead Name / Company</th>
                  <th>Contact Info</th>
                  <th>Source</th>
                  <th>Est. Value</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span className="badge bg-light text-primary border fw-bold">{l.leadCode}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">
                        <Link to={`/leads/${l.id}`} className="text-decoration-none text-dark">
                          {l.name}
                        </Link>
                      </div>
                      <div className="text-muted small">{l.companyName}</div>
                    </td>
                    <td>
                      <div className="small text-dark">{l.email}</div>
                      <div className="text-muted small">{l.phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border small">{l.source}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{formatCurrency(l.estimatedValue)}</span>
                    </td>
                    <td>
                      <span className="small text-muted">
                        {l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <Badge status={l.status} />
                    </td>
                    <td>
                      <span className="small text-muted">{formatDate(l.createdAt)}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link to={`/leads/${l.id}`} className="btn btn-outline-secondary" title="View Lead">
                          <i className="bi bi-eye"></i>
                        </Link>
                        {l.status !== 'CONVERTED' && (
                          <button
                            className="btn btn-outline-success"
                            title="Convert Lead to Opportunity"
                            onClick={() => setLeadToConvert(l)}
                          >
                            <i className="bi bi-arrow-repeat"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-outline-primary"
                          title="Edit Lead"
                          onClick={() => { setSelectedLead(l); setIsFormOpen(true); }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {canDelete && (
                          <button
                            className="btn btn-outline-danger"
                            title="Delete Lead"
                            onClick={() => setLeadToDelete(l)}
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

      {/* Lead Create/Edit Modal */}
      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedLead(null); }}
        onSave={handleSaveLead}
        lead={selectedLead}
        loading={actionLoading}
      />

      {/* Convert Lead Modal */}
      <LeadConvertModal
        isOpen={!!leadToConvert}
        onClose={() => setLeadToConvert(null)}
        onConvert={handleConvertLead}
        lead={leadToConvert}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        message={`Are you sure you want to delete lead "${leadToDelete?.name}" (${leadToDelete?.companyName})?`}
        confirmText="Delete Lead"
        loading={actionLoading}
      />
    </div>
  );
};
