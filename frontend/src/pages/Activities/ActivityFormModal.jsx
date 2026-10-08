import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { customerService } from '../../services/customerService.js';
import { leadService } from '../../services/leadService.js';
import { userService } from '../../services/userService.js';
import { ACTIVITY_TYPES, ACTIVITY_STATUSES } from '../../utils/constants.js';

export const ActivityFormModal = ({ isOpen, onClose, onSave, activity = null, loading = false }) => {
  const [formData, setFormData] = useState({
    associationType: 'NONE',
    customerId: '',
    leadId: '',
    type: 'CALL',
    subject: '',
    description: '',
    activityDate: new Date().toISOString().slice(0, 10),
    status: 'COMPLETED',
    assignedToId: ''
  });
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (activity) {
      const dateVal = activity.activityDate ? new Date(activity.activityDate).toISOString().slice(0, 10) : '';
      setFormData({
        associationType: activity.customerId ? 'CUSTOMER' : activity.leadId ? 'LEAD' : 'NONE',
        customerId: activity.customerId || '',
        leadId: activity.leadId || '',
        type: activity.type || 'CALL',
        subject: activity.subject || '',
        description: activity.description || '',
        activityDate: dateVal,
        status: activity.status || 'COMPLETED',
        assignedToId: activity.assignedToId || ''
      });
    } else {
      setFormData({
        associationType: 'NONE',
        customerId: '',
        leadId: '',
        type: 'CALL',
        subject: '',
        description: '',
        activityDate: new Date().toISOString().slice(0, 10),
        status: 'COMPLETED',
        assignedToId: ''
      });
    }
    setErrors([]);
  }, [activity, isOpen]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, leadRes, userRes] = await Promise.all([
          customerService.getCustomers({ limit: 100, status: 'ACTIVE' }),
          leadService.getLeads({ limit: 100 }),
          userService.getUsers({ limit: 100, isActive: true })
        ]);
        if (custRes.data) setCustomers(custRes.data);
        if (leadRes.data) setLeads(leadRes.data);
        if (userRes.data) setUsers(userRes.data);
      } catch (err) {
        console.error('Failed to load activity associations', err);
      }
    };
    if (isOpen) loadData();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errs = [];
    if (!formData.subject.trim()) errs.push('Activity subject is required');
    if (!formData.activityDate) errs.push('Activity date is required');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const payload = {
        type: formData.type,
        subject: formData.subject.trim(),
        description: formData.description.trim() || null,
        activityDate: new Date(formData.activityDate).toISOString(),
        customerId: formData.associationType === 'CUSTOMER' ? (formData.customerId ? Number(formData.customerId) : null) : null,
        leadId: formData.associationType === 'LEAD' ? (formData.leadId ? Number(formData.leadId) : null) : null,
        status: formData.status,
        assignedToId: formData.assignedToId ? Number(formData.assignedToId) : null
      };
      await onSave(payload);
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
      title={activity ? 'Edit Activity Record' : 'Log Sales Activity'}
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-primary-custom" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : activity ? 'Update Activity' : 'Log Activity'}
          </button>
        </div>
      }
    >
      {errors.length > 0 && <ErrorAlert message={errors.join(', ')} onClose={() => setErrors([])} />}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="act-type">Activity Type</label>
            <select
              id="act-type"
              name="type"
              className="form-select form-select-custom"
              value={formData.type}
              onChange={handleChange}
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="act-status">Status</label>
            <select
              id="act-status"
              name="status"
              className="form-select form-select-custom"
              value={formData.status}
              onChange={handleChange}
            >
              {ACTIVITY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="act-subject">Subject / Summary <span className="text-danger">*</span></label>
            <input
              id="act-subject"
              type="text"
              name="subject"
              className="form-control form-control-custom"
              placeholder="e.g. Sent technical architecture proposal via email"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="act-date">Activity Date <span className="text-danger">*</span></label>
            <input
              id="act-date"
              type="date"
              name="activityDate"
              className="form-control form-control-custom"
              value={formData.activityDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="act-assigned">Logged By / Assigned To</label>
            <select
              id="act-assigned"
              name="assignedToId"
              className="form-select form-select-custom"
              value={formData.assignedToId}
              onChange={handleChange}
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label-custom d-block">Related Record</label>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="associationType"
                id="act-none"
                value="NONE"
                checked={formData.associationType === 'NONE'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="act-none">None (General)</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="associationType"
                id="act-cust"
                value="CUSTOMER"
                checked={formData.associationType === 'CUSTOMER'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="act-cust">Customer</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="associationType"
                id="act-lead"
                value="LEAD"
                checked={formData.associationType === 'LEAD'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="act-lead">Lead</label>
            </div>
          </div>

          {formData.associationType === 'CUSTOMER' && (
            <div className="col-12">
              <label className="form-label-custom" htmlFor="act-customer">Select Customer</label>
              <select
                id="act-customer"
                name="customerId"
                className="form-select form-select-custom"
                value={formData.customerId}
                onChange={handleChange}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerCode} - {c.companyName} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.associationType === 'LEAD' && (
            <div className="col-12">
              <label className="form-label-custom" htmlFor="act-lead-sel">Select Lead</label>
              <select
                id="act-lead-sel"
                name="leadId"
                className="form-select form-select-custom"
                value={formData.leadId}
                onChange={handleChange}
              >
                <option value="">-- Choose Lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.leadCode} - {l.companyName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-12">
            <label className="form-label-custom" htmlFor="act-desc">Description / Interaction Details</label>
            <textarea
              id="act-desc"
              name="description"
              rows="3"
              className="form-control form-control-custom"
              placeholder="Notes, key takeaway points, action items..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
