import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    const roleName = typeof role === 'object' ? role.name : role;
    switch (roleName) {
      case 'ADMIN':
        return <span className="badge bg-danger">ADMIN</span>;
      case 'MANAGER':
        return <span className="badge bg-warning text-dark">MANAGER</span>;
      case 'SALES_EXECUTIVE':
      default:
        return <span className="badge bg-info text-dark">SALES EXEC</span>;
    }
  };

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-light d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <span className="text-muted small fw-medium d-none d-md-inline">
          <i className="bi bi-shield-check text-success me-1"></i> Enterprise Cloud CRM
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* User Info & Actions */}
        <div className="d-flex align-items-center gap-2">
          <div className="text-end d-none d-sm-block">
            <div className="fw-semibold small text-dark">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="d-flex align-items-center justify-content-end gap-1">
              {getRoleBadge(user?.role)}
            </div>
          </div>

          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
            style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}
          >
            {user?.firstName?.[0] || 'U'}
          </div>

          <button
            onClick={logout}
            className="btn btn-outline-danger btn-sm ms-2 d-flex align-items-center gap-1"
            title="Sign Out"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="d-none d-md-inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
