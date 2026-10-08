import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { customerService } from '../../services/customerService.js';
import { userService } from '../../services/userService.js';
import { OPPORTUNITY_STAGES, OPPORTUNITY_STATUSES } from '../../utils/constants.js';

export const OpportunityFormModal = ({ isOpen, onClose, onSave, opportunity = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    leadId: '',
    amount: 10000,
    stage: 'QUALIFICATION',
    probability: 10,
    expectedCloseDate: '',
    status: 'OPEN',
    notes: '',
    assignedToId: ''
  });
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (opportunity) {
      const closeDate = opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toISOString().split('T')[0] : '';
      setFormData({
        name: opportunity.name || '',
        customerId: opportunity.customerId || '',
        leadId: opportunity.leadId || '',
        amount: opportunity.amount || 0,
        stage: opportunity.stage || 'QUALIFICATION',
        probability: opportunity.probability !== undefined ? opportunity.probability : 10,
        expectedCloseDate: closeDate,
        status: opportunity.status || 'OPEN',
        notes: opportunity.notes || '',
        assignedToId: opportunity.assignedToId || ''
      });
    } else {
      const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        name: '',
        customerId: '',
        leadId: '',
        amount: 10000,
        stage: 'QUALIFICATION',
        probability: 10,
        expectedCloseDate: defaultDate,
        status: 'OPEN',
        notes: '',
        assignedToId: ''
      });
    }
    setErrors([]);
  }, [opportunity, isOpen]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [custRes, userRes] = await Promise.all([
          customerService.getCustomers({ limit: 100, status: 'ACTIVE' }),
          userService.getUsers({ limit: 100, isActive: true })
        ]);
        if (custRes.data) setCustomers(custRes.data);
        if (userRes.data) setUsers(userRes.data);
      } catch (err) {
        console.error('Failed to load dropdown data', err);
      }
    };
    if (isOpen) loadDropdowns();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStageChange = (e) => {
    const stage = e.target.value;
    const stageObj = OPPORTUNITY_STAGES.find((s) => s.value === stage);
    let status = 'OPEN';
    if (stage === 'WON') status = 'WON';
    if (stage === 'LOST') status = 'LOST';

    setFormData((prev) => ({
      ...prev,
      stage,
      status,
      probability: stageObj ? stageObj.defaultProb : prev.probability
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errs = [];
    if (!formData.name.trim()) errs.push('Opportunity name is required');
    if (!formData.customerId) errs.push('Associated customer account is required');
    if (formData.amount === undefined || Number(formData.amount) <= 0) errs.push('Deal amount must be greater than 0');
    if (!formData.expectedCloseDate) errs.push('Expected close date is required');

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
      title={opportunity ? `Edit Opportunity: ${opportunity.opportunityCode}` : 'Create New Opportunity'}
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-primary-custom" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : opportunity ? 'Update Deal' : 'Create Deal'}
          </button>
        </div>
      }
    >
      {errors.length > 0 && <ErrorAlert message={errors.join(', ')} onClose={() => setErrors([])} />}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label-custom" htmlFor="opp-name">Opportunity Name <span className="text-danger">*</span></label>
            <input
              id="opp-name"
              type="text"
              name="name"
              className="form-control form-control-custom"
              placeholder="e.g. Vance IoT Telemetry Cloud Modernization"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="opp-customer">Customer Account <span className="text-danger">*</span></label>
            <select
              id="opp-customer"
              name="customerId"
              className="form-select form-select-custom"
              value={formData.customerId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerCode} - {c.companyName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="opp-amount">Deal Value ($) <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">$</span>
              <input
                id="opp-amount"
                type="number"
                name="amount"
                min="1"
                step="100"
                className="form-control form-control-custom border-start-0"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="opp-stage">Pipeline Stage</label>
            <select
              id="opp-stage"
              name="stage"
              className="form-select form-select-custom"
              value={formData.stage}
              onChange={handleStageChange}
            >
              {OPPORTUNITY_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="opp-prob">Win Probability ({formData.probability}%)</label>
            <input
              id="opp-prob"
              type="range"
              name="probability"
              className="form-range mt-2"
              min="0"
              max="100"
              step="5"
              value={formData.probability}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label-custom" htmlFor="opp-status">Deal Status</label>
            <select
              id="opp-status"
              name="status"
              className="form-select form-select-custom"
              value={formData.status}
              onChange={handleChange}
            >
              {OPPORTUNITY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="opp-close-date">Expected Close Date <span className="text-danger">*</span></label>
            <input
              id="opp-close-date"
              type="date"
              name="expectedCloseDate"
              className="form-control form-control-custom"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="opp-assigned">Assigned Deal Owner</label>
            <select
              id="opp-assigned"
              name="assignedToId"
              className="form-select form-select-custom"
              value={formData.assignedToId}
              onChange={handleChange}
            >
              <option value="">-- Select Deal Owner --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="opp-notes">Commercial Terms / Notes</label>
            <textarea
              id="opp-notes"
              name="notes"
              rows="3"
              className="form-control form-control-custom"
              placeholder="Terms, license details, payment milestones..."
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
