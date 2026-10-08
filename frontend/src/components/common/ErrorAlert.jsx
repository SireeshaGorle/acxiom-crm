import React from 'react';

export const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-3 py-2 px-3 small" role="alert">
      <i className="bi bi-exclamation-octagon-fill fs-5"></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button type="button" className="btn-close py-2" onClick={onClose} aria-label="Close"></button>
      )}
    </div>
  );
};
