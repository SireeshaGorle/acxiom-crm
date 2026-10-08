import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { userService } from '../../services/userService.js';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../utils/constants.js';

export const LeadFormModal = ({ isOpen, onClose, onSave, lead = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    source: 'WEBSITE',
    status: 'NEW',
    estimatedValue: 0,
    notes: '',
    assignedToId: ''
  });
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        companyName: lead.companyName || '',
        source: lead.source || 'WEBSITE',
        status: lead.status || 'NEW',
        estimatedValue: lead.estimatedValue || 0,
        notes: lead.notes || '',
        assignedToId: lead.assignedToId || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        source: 'WEBSITE',
        status: 'NEW',
        estimatedValue: 0,
        notes: '',
        assignedToId: ''
      });
    }
    setErrors([]);
  }, [lead, isOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers({ limit: 100, isActive: true });
        if (res.data) setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users', err);
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

    const errs = [];
    if (!formData.name.trim()) errs.push('Lead name is required');
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.push('Valid email is required');
    if (!formData.phone.trim()) errs.push('Phone number is required');
    if (!formData.companyName.trim()) errs.push('Company name is required');
    if (formData.estimatedValue < 0) errs.push('Estimated value cannot be negative');

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
      title={lead ? `Edit Lead: ${lead.leadCode}` : 'Create New Lead'}
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-primary-custom" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>
      }
    >
      {errors.length > 0 && <ErrorAlert message={errors.join(', ')} onClose={() => setErrors([])} />}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="lead-name">Contact Person Name <span className="text-danger">*</span></label>
            <input
              id="lead-name"
              type="text"
              name="name"
              className="form-control form-control-custom"
              placeholder="e.g. Vikram Mehta"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="lead-company">Company / Organization <span className="text-danger">*</span></label>
            <input
              id="lead-company"
              type="text"
              name="companyName"
              className="form-control form-control-custom"
              placeholder="e.g. Apex Cloud India"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="lead-email">Email Address <span className="text-danger">*</span></label>
            <input
              id="lead-email"
              type="email"
              name="email"
              className="form-control form-control-custom"
              placeholder="vikram@apexcloud.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="lead-phone">Phone Number <span className="text-danger">*</span></label>
            <input
              id="lead-phone"
              type="tel"
              name="phone"
              className="form-control form-control-custom"
              placeholder="+1 408-555-0123"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="lead-source">Lead Source</label>
            <select
              id="lead-source"
              name="source"
              className="form-select form-select-custom"
              value={formData.source}
              onChange={handleChange}
            >
              {LEAD_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="lead-status">Lead Status</label>
            <select
              id="lead-status"
              name="status"
              className="form-select form-select-custom"
              value={formData.status}
              onChange={handleChange}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="lead-est-val">Estimated Value ($)</label>
            <input
              id="lead-est-val"
              type="number"
              name="estimatedValue"
              min="0"
              step="100"
              className="form-control form-control-custom"
              value={formData.estimatedValue}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="lead-assigned">Assigned Sales Executive</label>
            <select
              id="lead-assigned"
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

          <div className="col-12">
            <label className="form-label-custom" htmlFor="lead-notes">Notes / Requirements</label>
            <textarea
              id="lead-notes"
              name="notes"
              rows="3"
              className="form-control form-control-custom"
              placeholder="Enter discovery notes or specific customer requirements..."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
