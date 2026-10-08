export const validateCustomer = (data, isUpdate = false) => {
  const errors = [];
  const { name, email, phone, companyName, status } = data;

  if (!isUpdate || name !== undefined) {
    if (!name || name.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters');
    }
  }

  if (!isUpdate || email !== undefined) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email address is required');
    }
  }

  if (!isUpdate || phone !== undefined) {
    if (!phone || phone.trim().length < 7) {
      errors.push('Valid phone number (at least 7 digits) is required');
    }
  }

  if (!isUpdate || companyName !== undefined) {
    if (!companyName || companyName.trim().length < 2) {
      errors.push('Company name is required');
    }
  }

  if (status !== undefined) {
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      errors.push('Status must be ACTIVE or INACTIVE');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
