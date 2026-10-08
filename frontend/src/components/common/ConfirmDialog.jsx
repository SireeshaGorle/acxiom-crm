import React from 'react';
import { Modal } from './Modal.jsx';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action? This cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      }
    >
      <div className="d-flex align-items-start gap-3">
        <div className={`p-2 rounded-circle bg-${confirmVariant} bg-opacity-10 text-${confirmVariant}`}>
          <i className="bi bi-exclamation-triangle-fill fs-4"></i>
        </div>
        <div>
          <p className="text-secondary small mb-0">{message}</p>
        </div>
      </div>
    </Modal>
  );
};
