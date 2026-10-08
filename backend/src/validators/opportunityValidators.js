export const validOpportunityStages = ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
export const validOpportunityStatuses = ['OPEN', 'WON', 'LOST'];

export const validateOpportunity = (data, isUpdate = false) => {
  const errors = [];
  const { name, customerId, amount, stage, probability, expectedCloseDate, status } = data;

  if (!isUpdate || name !== undefined) {
    if (!name || name.trim().length < 2) {
      errors.push('Opportunity name must be at least 2 characters');
    }
  }

  if (!isUpdate) {
    if (!customerId || isNaN(Number(customerId))) {
      errors.push('Valid customer ID is required');
    }
  }

  if (!isUpdate || amount !== undefined) {
    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.push('Amount must be a positive number greater than 0');
    }
  }

  if (stage !== undefined) {
    if (!validOpportunityStages.includes(stage)) {
      errors.push(`Stage must be one of: ${validOpportunityStages.join(', ')}`);
    }
  }

  if (probability !== undefined) {
    const prob = Number(probability);
    if (isNaN(prob) || prob < 0 || prob > 100) {
      errors.push('Probability must be an integer between 0 and 100');
    }
  }

  if (!isUpdate || expectedCloseDate !== undefined) {
    if (!expectedCloseDate) {
      errors.push('Expected close date is required');
    } else {
      const closeDate = new Date(expectedCloseDate);
      if (isNaN(closeDate.getTime())) {
        errors.push('Valid expected close date is required');
      }
    }
  }

  if (status !== undefined) {
    if (!validOpportunityStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validOpportunityStatuses.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
