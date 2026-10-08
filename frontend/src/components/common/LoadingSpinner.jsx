import React from 'react';

export const LoadingSpinner = ({ message = 'Loading data...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted small mb-0 fw-medium">{message}</p>
    </div>
  );
};
