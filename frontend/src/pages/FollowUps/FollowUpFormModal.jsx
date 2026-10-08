import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { customerService } from '../../services/customerService.js';
import { leadService } from '../../services/leadService.js';
import { userService } from '../../services/userService.js';
import { FOLLOWUP_TYPES, FOLLOWUP_STATUSES } from '../../utils/constants.js';

export const FollowUpFormModal = ({ isOpen, onClose, onSave, followUp = null, loading = false }) => {
  const [formData, setFormData] = useState({
    associationType: 'CUSTOMER', // 'CUSTOMER' or 'LEAD'
    customerId: '',
    leadId: '',
    followUpDate: '',
    type: 'CALL',
    remarks: '',
    status: 'PLANNED',
    assignedToId: ''
  });
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (followUp) {
      const dateVal = followUp.followUpDate ? new Date(followUp.followUpDate).toISOString().slice(0, 16) : '';
      setFormData({
        associationType: followUp.customerId ? 'CUSTOMER' : 'LEAD',
        customerId: followUp.customerId || '',
        leadId: followUp.leadId || '',
        followUpDate: dateVal,
        type: followUp.type || 'CALL',
        remarks: followUp.remarks || '',
        status: followUp.status || 'PLANNED',
        assignedToId: followUp.assignedToId || ''
      });
    } else {
      // Default to tomorrow 10:00 AM
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      tomorrow.setHours(10, 0, 0, 0);
      const defaultDate = tomorrow.toISOString().slice(0, 16);

      setFormData({
        associationType: 'CUSTOMER',
        customerId: '',
        leadId: '',
        followUpDate: defaultDate,
        type: 'CALL',
        remarks: '',
        status: 'PLANNED',
        assignedToId: ''
      });
    }
    setErrors([]);
  }, [followUp, isOpen]);

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
        console.error('Failed to load associations', err);
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
    if (formData.associationType === 'CUSTOMER' && !formData.customerId) {
      errs.push('Please select a customer account');
    }
    if (formData.associationType === 'LEAD' && !formData.leadId) {
      errs.push('Please select a prospective lead');
    }
    if (!formData.followUpDate) errs.push('Follow-up date & time is required');
    if (!formData.remarks.trim()) errs.push('Remarks / agenda are required');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    try {
      const payload = {
        customerId: formData.associationType === 'CUSTOMER' ? formData.customerId : null,
        leadId: formData.associationType === 'LEAD' ? formData.leadId : null,
        followUpDate: new Date(formData.followUpDate).toISOString(),
        type: formData.type,
        remarks: formData.remarks,
        status: formData.status,
        assignedToId: formData.assignedToId || null
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
      title={followUp ? 'Edit Follow-Up Task' : 'Schedule New Follow-Up'}
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-primary-custom" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : followUp ? 'Update Follow-Up' : 'Schedule Follow-Up'}
          </button>
        </div>
      }
    >
      {errors.length > 0 && <ErrorAlert message={errors.join(', ')} onClose={() => setErrors([])} />}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Association Radio */}
          <div className="col-12">
            <label className="form-label-custom d-block">Associate With</label>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="associationType"
                id="assoc-cust"
                value="CUSTOMER"
                checked={formData.associationType === 'CUSTOMER'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="assoc-cust">Customer Account</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="associationType"
                id="assoc-lead"
                value="LEAD"
                checked={formData.associationType === 'LEAD'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="assoc-lead">Sales Lead</label>
            </div>
          </div>

          {formData.associationType === 'CUSTOMER' ? (
            <div className="col-12 col-md-6">
              <label className="form-label-custom" htmlFor="fup-customer">Select Customer <span className="text-danger">*</span></label>
              <select
                id="fup-customer"
                name="customerId"
                className="form-select form-select-custom"
                value={formData.customerId}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerCode} - {c.companyName} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="col-12 col-md-6">
              <label className="form-label-custom" htmlFor="fup-lead">Select Lead <span className="text-danger">*</span></label>
              <select
                id="fup-lead"
                name="leadId"
                className="form-select form-select-custom"
                value={formData.leadId}
                onChange={handleChange}
                required
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

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="fup-type">Communication Type</label>
            <select
              id="fup-type"
              name="type"
              className="form-select form-select-custom"
              value={formData.type}
              onChange={handleChange}
            >
              {FOLLOWUP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="fup-date">Scheduled Date & Time <span className="text-danger">*</span></label>
            <input
              id="fup-date"
              type="datetime-local"
              name="followUpDate"
              className="form-control form-control-custom"
              value={formData.followUpDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="fup-status">Task Status</label>
            <select
              id="fup-status"
              name="status"
              className="form-select form-select-custom"
              value={formData.status}
              onChange={handleChange}
            >
              {FOLLOWUP_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="fup-assigned">Assigned Executive / Representative</label>
            <select
              id="fup-assigned"
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
            <label className="form-label-custom" htmlFor="fup-remarks">Agenda / Meeting Remarks <span className="text-danger">*</span></label>
            <textarea
              id="fup-remarks"
              name="remarks"
              rows="3"
              className="form-control form-control-custom"
              placeholder="e.g. Discuss quarterly licensing renewals and technical roadmap..."
              value={formData.remarks}
              onChange={handleChange}
              required
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
