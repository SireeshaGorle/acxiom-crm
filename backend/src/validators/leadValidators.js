export const validLeadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST'];
export const validLeadSources = ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EXHIBITION', 'SOCIAL_MEDIA', 'OTHER'];

export const validateLead = (data, isUpdate = false) => {
  const errors = [];
  const { name, email, phone, companyName, status, estimatedValue, source } = data;

  if (!isUpdate || name !== undefined) {
    if (!name || name.trim().length < 2) {
      errors.push('Lead name must be at least 2 characters');
    }
  }

  if (!isUpdate || email !== undefined) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email address is required');
    }
  }

  if (!isUpdate || phone !== undefined) {
    if (!phone || phone.trim().length < 7) {
      errors.push('Valid phone number is required');
    }
  }

  if (!isUpdate || companyName !== undefined) {
    if (!companyName || companyName.trim().length < 2) {
      errors.push('Company name is required');
    }
  }

  if (status !== undefined) {
    if (!validLeadStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validLeadStatuses.join(', ')}`);
    }
  }

  if (source !== undefined) {
    if (!validLeadSources.includes(source)) {
      errors.push(`Source must be one of: ${validLeadSources.join(', ')}`);
    }
  }

  if (estimatedValue !== undefined) {
    if (isNaN(Number(estimatedValue)) || Number(estimatedValue) < 0) {
      errors.push('Estimated value must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLeadConversion = (data) => {
  const errors = [];
  const { opportunityName, amount, expectedCloseDate } = data;

  if (!opportunityName || opportunityName.trim().length < 2) {
    errors.push('Opportunity name is required for lead conversion');
  }

  if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.push('Opportunity amount must be greater than 0');
  }

  if (!expectedCloseDate) {
    errors.push('Expected close date is required');
  } else {
    const closeDate = new Date(expectedCloseDate);
    if (isNaN(closeDate.getTime())) {
      errors.push('Invalid expected close date format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
