import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return (
      <div className="alert alert-danger p-4 m-4 rounded-3 shadow-sm text-center">
        <i className="bi bi-shield-lock-fill fs-1 text-danger mb-2 d-block"></i>
        <h5 className="fw-bold">403 — Unauthorized Access</h5>
        <p className="text-muted small mb-3">
          Your role (<strong>{typeof user?.role === 'object' ? user?.role.name : user?.role}</strong>) does not have sufficient permission to view this module.
        </p>
        <a href="/dashboard" className="btn btn-sm btn-primary">
          Back to Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
};
