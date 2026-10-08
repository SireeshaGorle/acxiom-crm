export const validActivityTypes = ['CALL', 'MEETING', 'EMAIL', 'TASK'];
export const validActivityStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const validateActivity = (data, isUpdate = false) => {
  const errors = [];
  const { type, subject, status } = data;

  if (!isUpdate || subject !== undefined) {
    if (!subject || subject.trim().length < 2) {
      errors.push('Subject must be at least 2 characters');
    }
  }

  if (type !== undefined) {
    if (!validActivityTypes.includes(type)) {
      errors.push(`Type must be one of: ${validActivityTypes.join(', ')}`);
    }
  }

  if (status !== undefined) {
    if (!validActivityStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validActivityStatuses.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
