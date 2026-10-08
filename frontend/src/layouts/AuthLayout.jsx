import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center py-5 bg-light" style={{ backgroundColor: '#f1f5f9' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 col-xl-4">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 p-3 shadow-sm mb-2">
                <i className="bi bi-diagram-3-fill fs-2"></i>
              </div>
              <h3 className="fw-extrabold text-dark mb-1">ACXIOM<span className="text-primary">CRM</span></h3>
              <p className="text-muted small">Enterprise Customer Relationship Management</p>
            </div>
            <div className="card-custom p-4 shadow-sm bg-white rounded-3">
              <Outlet />
            </div>
            <div className="text-center mt-4 text-muted small">
              &copy; {new Date().getFullYear()} ACXIOMCRM. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
