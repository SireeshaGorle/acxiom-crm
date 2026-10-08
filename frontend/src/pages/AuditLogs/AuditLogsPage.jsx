import React, { useState, useEffect, useCallback } from 'react';
import { auditService } from '../../services/auditService.js';
import { SearchFilterBar } from '../../components/common/SearchFilterBar.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');

  // Selected Log for JSON payload inspection
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await auditService.getAuditLogs({
        page,
        limit,
        search,
        action,
        entity
      });
      setLogs(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, action, entity]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (act) => {
    switch (act) {
      case 'LOGIN':
        return <span className="badge bg-success">LOGIN</span>;
      case 'FAILED_LOGIN':
      case 'SECURITY_EVENT':
        return <span className="badge bg-danger">SECURITY</span>;
      case 'CREATE':
        return <span className="badge bg-primary">CREATE</span>;
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return <span className="badge bg-info text-dark">UPDATE</span>;
      case 'DELETE':
      case 'DEACTIVATE':
        return <span className="badge bg-danger">DELETE</span>;
      case 'CONVERT_LEAD':
        return <span className="badge bg-success">CONVERT</span>;
      case 'ROLE_CHANGE':
        return <span className="badge bg-warning text-dark">ROLE CHANGE</span>;
      default:
        return <span className="badge bg-secondary">{act}</span>;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-0">System Audit Trail</h4>
          <p className="text-muted small mb-0">Immutable record of security events, authentication attempts, and data modifications.</p>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      {/* Main Card */}
      <div className="card-custom p-3 p-md-4">
        <SearchFilterBar
          searchPlaceholder="Search by user email, entity, action..."
          searchValue={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          filterOptions={[
            { value: 'LOGIN', label: 'LOGIN' },
            { value: 'FAILED_LOGIN', label: 'FAILED LOGIN' },
            { value: 'CREATE', label: 'CREATE' },
            { value: 'UPDATE', label: 'UPDATE' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'CONVERT_LEAD', label: 'CONVERT LEAD' },
            { value: 'ROLE_CHANGE', label: 'ROLE CHANGE' },
            { value: 'SECURITY_EVENT', label: 'SECURITY EVENT' }
          ]}
          filterValue={action}
          onFilterChange={(val) => { setAction(val); setPage(1); }}
          filterLabel="All Actions"
          extraFilters={
            <select
              className="form-select form-select-sm form-select-custom"
              value={entity}
              onChange={(e) => { setEntity(e.target.value); setPage(1); }}
            >
              <option value="">All Entities</option>
              <option value="AUTH">AUTH</option>
              <option value="USER">USER</option>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="LEAD">LEAD</option>
              <option value="OPPORTUNITY">OPPORTUNITY</option>
              <option value="FOLLOWUP">FOLLOWUP</option>
              <option value="ACTIVITY">ACTIVITY</option>
            </select>
          }
          canAdd={false}
        />

        {loading ? (
          <LoadingSpinner message="Querying security audit logs..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon="bi-shield-lock"
            title="No audit logs recorded"
            description="Audit events matching your search will appear here."
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Record ID</th>
                  <th>User / Email</th>
                  <th>IP Address</th>
                  <th className="text-end">Changes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="small fw-semibold text-dark">{formatDateTime(log.createdAt)}</span>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <span className="badge bg-light text-dark border small">{log.entity}</span>
                    </td>
                    <td>
                      <span className="small text-muted">{log.recordId || '—'}</span>
                    </td>
                    <td>
                      <div className="small fw-semibold text-dark">{log.userEmail}</div>
                      {log.user && (
                        <div className="text-muted small">
                          {log.user.firstName} {log.user.lastName} ({log.user.role?.name})
                        </div>
                      )}
                    </td>
                    <td>
                      <code className="small text-muted">{log.ipAddress}</code>
                    </td>
                    <td className="text-end">
                      {(log.oldValue || log.newValue) ? (
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2 small"
                          onClick={() => setSelectedLog(log)}
                        >
                          <i className="bi bi-code-square me-1"></i> Inspect
                        </button>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
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

      {/* JSON Payload Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Payload Detail: #${selectedLog.id} (${selectedLog.action} on ${selectedLog.entity})`}
          size="lg"
          footer={
            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedLog(null)}>
              Close
            </button>
          }
        >
          <div className="row g-3">
            {selectedLog.oldValue && (
              <div className="col-12 col-md-6">
                <h6 className="fw-bold small text-danger">Previous State (Old Value)</h6>
                <pre className="p-3 bg-light rounded small border" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {typeof selectedLog.oldValue === 'string'
                    ? (() => { try { return JSON.stringify(JSON.parse(selectedLog.oldValue), null, 2); } catch { return selectedLog.oldValue; } })()
                    : JSON.stringify(selectedLog.oldValue, null, 2)}
                </pre>
              </div>
            )}
            {selectedLog.newValue && (
              <div className={`col-12 ${selectedLog.oldValue ? 'col-md-6' : 'col-12'}`}>
                <h6 className="fw-bold small text-success">Updated / New State</h6>
                <pre className="p-3 bg-light rounded small border" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {typeof selectedLog.newValue === 'string'
                    ? (() => { try { return JSON.stringify(JSON.parse(selectedLog.newValue), null, 2); } catch { return selectedLog.newValue; } })()
                    : JSON.stringify(selectedLog.newValue, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
