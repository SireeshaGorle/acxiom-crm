import React from 'react';

export const Pagination = ({ page, totalPages, total, limit, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const start = Math.min((page - 1) * limit + 1, total);
  const end = Math.min(page * limit, total);

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
      <div className="text-muted small">
        Showing <span className="fw-semibold text-dark">{start}</span> to{' '}
        <span className="fw-semibold text-dark">{end}</span> of{' '}
        <span className="fw-semibold text-dark">{total}</span> records
      </div>

      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Show first, last, and near current page
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return (
              <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(p)}>
                  {p}
                </button>
              </li>
            );
          } else if (p === page - 2 || p === page + 2) {
            return (
              <li key={p} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }
          return null;
        })}

        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </div>
  );
};
