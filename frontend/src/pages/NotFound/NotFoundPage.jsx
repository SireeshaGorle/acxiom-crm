import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <div className="display-1 fw-bold text-primary mb-2">404</div>
      <h4 className="fw-bold text-dark mb-2">Page Not Found</h4>
      <p className="text-muted small mb-4">
        The requested CRM page or resource could not be found or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary-custom">
        <i className="bi bi-arrow-left me-1"></i> Return to Dashboard
      </Link>
    </div>
  );
};
