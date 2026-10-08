export const validFollowUpTypes = ['CALL', 'MEETING', 'EMAIL', 'TASK'];
export const validFollowUpStatuses = ['PLANNED', 'COMPLETED', 'MISSED', 'CANCELLED'];

export const validateFollowUp = (data, isUpdate = false) => {
  const errors = [];
  const { customerId, leadId, followUpDate, type, remarks, status } = data;

  if (!isUpdate) {
    if (!customerId && !leadId) {
      errors.push('Follow-up must be associated with either a Customer or a Lead');
    }
  }

  if (!isUpdate || followUpDate !== undefined) {
    if (!followUpDate) {
      errors.push('Follow-up date is required');
    } else {
      const date = new Date(followUpDate);
      if (isNaN(date.getTime())) {
        errors.push('Valid follow-up date and time is required');
      }
    }
  }

  if (type !== undefined) {
    if (!validFollowUpTypes.includes(type)) {
      errors.push(`Type must be one of: ${validFollowUpTypes.join(', ')}`);
    }
  }

  if (status !== undefined) {
    if (!validFollowUpStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validFollowUpStatuses.join(', ')}`);
    }
  }

  if (!isUpdate || remarks !== undefined) {
    if (!remarks || remarks.trim().length === 0) {
      errors.push('Remarks/notes are required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
