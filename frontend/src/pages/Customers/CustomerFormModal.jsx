import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { userService } from '../../services/userService.js';

export const CustomerFormModal = ({ isOpen, onClose, onSave, customer = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    status: 'ACTIVE',
    assignedToId: ''
  });
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        companyName: customer.companyName || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        status: customer.status || 'ACTIVE',
        assignedToId: customer.assignedToId || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        address: '',
        city: '',
        state: '',
        status: 'ACTIVE',
        assignedToId: ''
      });
    }
    setErrors([]);
  }, [customer, isOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers({ limit: 100, isActive: true });
        if (res.data) setUsers(res.data);
      } catch (err) {
        console.error('Failed to load user list', err);
      }
    };
    if (isOpen) fetchUsers();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Client-side validation
    const errs = [];
    if (!formData.name.trim()) errs.push('Customer name is required');
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.push('Valid email is required');
    if (!formData.phone.trim()) errs.push('Phone number is required');
    if (!formData.companyName.trim()) errs.push('Company name is required');

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
      title={customer ? `Edit Customer: ${customer.customerCode}` : 'Create New Customer'}
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-primary-custom" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      }
    >
      {errors.length > 0 && (
        <ErrorAlert message={errors.join(', ')} onClose={() => setErrors([])} />
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="cust-name">Full Name <span className="text-danger">*</span></label>
            <input
              id="cust-name"
              type="text"
              name="name"
              className="form-control form-control-custom"
              placeholder="e.g. Robert Vance"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="cust-company">Company Name <span className="text-danger">*</span></label>
            <input
              id="cust-company"
              type="text"
              name="companyName"
              className="form-control form-control-custom"
              placeholder="e.g. Vance Refrigeration"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="cust-email">Email Address <span className="text-danger">*</span></label>
            <input
              id="cust-email"
              type="email"
              name="email"
              className="form-control form-control-custom"
              placeholder="robert@vance.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="cust-phone">Phone Number <span className="text-danger">*</span></label>
            <input
              id="cust-phone"
              type="tel"
              name="phone"
              className="form-control form-control-custom"
              placeholder="+1 555-0190"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="cust-address">Street Address</label>
            <input
              id="cust-address"
              type="text"
              name="address"
              className="form-control form-control-custom"
              placeholder="123 Corporate Blvd"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="cust-city">City</label>
            <input
              id="cust-city"
              type="text"
              name="city"
              className="form-control form-control-custom"
              placeholder="New York"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="cust-state">State / Province</label>
            <input
              id="cust-state"
              type="text"
              name="state"
              className="form-control form-control-custom"
              placeholder="NY"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="cust-status">Status</label>
            <select
              id="cust-status"
              name="status"
              className="form-select form-select-custom"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="cust-assigned">Assigned Sales Executive / Owner</label>
            <select
              id="cust-assigned"
              name="assignedToId"
              className="form-select form-select-custom"
              value={formData.assignedToId}
              onChange={handleChange}
            >
              <option value="">-- Select Assigned User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role?.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
