import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.jsx';
import { ErrorAlert } from '../../components/common/ErrorAlert.jsx';
import { OPPORTUNITY_STAGES } from '../../utils/constants.js';

export const LeadConvertModal = ({ isOpen, onClose, onConvert, lead = null, loading = false }) => {
  const [formData, setFormData] = useState({
    opportunityName: '',
    amount: 10000,
    stage: 'QUALIFICATION',
    probability: 25,
    expectedCloseDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (lead) {
      // Set expected close date to 30 days from now
      const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        opportunityName: `${lead.companyName} - Enterprise Deal`,
        amount: lead.estimatedValue > 0 ? lead.estimatedValue : 15000,
        stage: 'QUALIFICATION',
        probability: 25,
        expectedCloseDate: defaultDate,
        notes: `Converted from lead ${lead.leadCode}. ${lead.notes || ''}`
      });
    }
    setErrors([]);
  }, [lead, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStageChange = (e) => {
    const selectedStage = e.target.value;
    const stageObj = OPPORTUNITY_STAGES.find((s) => s.value === selectedStage);
    setFormData((prev) => ({
      ...prev,
      stage: selectedStage,
      probability: stageObj ? stageObj.defaultProb : prev.probability
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const errs = [];
    if (!formData.opportunityName.trim()) errs.push('Opportunity name is required');
    if (!formData.amount || Number(formData.amount) <= 0) errs.push('Opportunity amount must be greater than 0');
    if (!formData.expectedCloseDate) errs.push('Expected close date is required');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await onConvert(formData);
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        setErrors(err.errors);
      } else {
        setErrors([err.message || 'Lead conversion failed']);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Convert Lead to Opportunity: ${lead?.leadCode}`}
      size="lg"
      footer={
        <div className="d-flex justify-content-end gap-2 w-100">
          <button type="button" className="btn btn-sm btn-light border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn btn-sm btn-success" onClick={handleSubmit} disabled={loading}>
            <i className="bi bi-arrow-repeat me-1"></i>
            {loading ? 'Converting...' : 'Convert Lead Now'}
          </button>
        </div>
      }
    >
      {errors.length > 0 && <ErrorAlert message={errors.join(', ')} onClose={() => setErrors([])} />}

      <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-info-circle-fill fs-5"></i>
        <div>
          Converting this lead will automatically create an active <strong>Customer Profile</strong> for <em>{lead?.name} ({lead?.companyName})</em> and link this new <strong>Opportunity</strong> into your active sales pipeline.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label-custom" htmlFor="convert-opp-name">Opportunity / Deal Name <span className="text-danger">*</span></label>
            <input
              id="convert-opp-name"
              type="text"
              name="opportunityName"
              className="form-control form-control-custom"
              value={formData.opportunityName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="convert-amount">Deal Amount ($) <span className="text-danger">*</span></label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">$</span>
              <input
                id="convert-amount"
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

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="convert-stage">Initial Pipeline Stage</label>
            <select
              id="convert-stage"
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

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="convert-prob">Win Probability ({formData.probability}%)</label>
            <input
              id="convert-prob"
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

          <div className="col-12 col-md-6">
            <label className="form-label-custom" htmlFor="convert-close-date">Expected Close Date <span className="text-danger">*</span></label>
            <input
              id="convert-close-date"
              type="date"
              name="expectedCloseDate"
              className="form-control form-control-custom"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label-custom" htmlFor="convert-notes">Deal Conversion Notes</label>
            <textarea
              id="convert-notes"
              name="notes"
              rows="3"
              className="form-control form-control-custom"
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
      </form>
    </Modal>
  );
};
