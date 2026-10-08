import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { userService } from '../../services/userService.js';

export const UserFormModal = ({ isOpen, onClose, onSave, user = null, loading = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    roleId: 3,
    isActive: true
  });
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        roleId: user.roleId || user.role?.id || 3,
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        roleId: 3,
        isActive: true
      });
    }
    setErrors([]);
  }, [user, isOpen]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await userService.getRoles();
        if (res.data) setRoles(res.data);
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    };
    if (isOpen) fetchRoles();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errs = [];
    if (!formData.firstName.trim()) errs.push('First name is required');
    if (!formData.lastName.trim()) errs.push('Last name is required');
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.push('Valid email address is required');
    if (!user && (!formData.password || formData.password.length < 6)) {
      errs.push('Password must be at least 6 characters');
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        setErrors(err.errors);
      } else {
        setErrors([err.message || 'Operation failed']);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Edit User: ${user.firstName} ${user.lastName}` : 'Add New Team Member'}
      size="md"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-primary-custom" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      }
    >
      {errors.length > 0 && <ErrorAlert message={errors.join(', ')} onClose={() => setErrors([])} />}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="usr-first">First Name <span className="text-danger">*</span></label>
            <input
              id="usr-first"
              type="text"
              name="firstName"
              className="form-control form-control-custom"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="usr-last">Last Name <span className="text-danger">*</span></label>
            <input
              id="usr-last"
              type="text"
              name="lastName"
              className="form-control form-control-custom"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="usr-email">Email Address <span className="text-danger">*</span></label>
            <input
              id="usr-email"
              type="email"
              name="email"
              className="form-control form-control-custom"
              placeholder="user@acxiomcrm.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {!user && (
            <div className="col-12">
              <label className="form-label-custom" htmlFor="usr-pass">Initial Password <span className="text-danger">*</span></label>
              <input
                id="usr-pass"
                type="password"
                name="password"
                className="form-control form-control-custom"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="usr-phone">Phone</label>
            <input
              id="usr-phone"
              type="tel"
              name="phone"
              className="form-control form-control-custom"
              placeholder="+1 555-0100"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="usr-role">System Role <span className="text-danger">*</span></label>
            <select
              id="usr-role"
              name="roleId"
              className="form-select form-select-custom"
              value={formData.roleId}
              onChange={handleChange}
              required
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <div className="form-check form-switch mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="userActiveSwitch"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label className="form-check-label small fw-semibold" htmlFor="userActiveSwitch">
                Account Active & Enabled
              </label>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
