import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';

export const PasswordResetModal = ({ isOpen, onClose, onReset, user = null, loading = false }) => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await onReset(newPassword);
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reset Password: ${user?.firstName} ${user?.lastName}`}
      size="sm"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-warning" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Resetting...' : 'Set Password'}
          </button>
        </div>
      }
    >
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label-custom" htmlFor="rst-pass">New Temporary Password <span className="text-danger">*</span></label>
          <input
            id="rst-pass"
            type="password"
            className="form-control form-control-custom"
            placeholder="Enter new password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="form-text small">
            This will reset failed login lockouts and update the credentials immediately.
          </div>
        </div>
      </form>
    </Modal>
  );
};
