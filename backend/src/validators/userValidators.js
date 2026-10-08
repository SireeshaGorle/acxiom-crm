export const validateUserCreate = (data) => {
  const errors = [];
  const { email, password, firstName, lastName, roleId } = data;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!firstName || firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!lastName || lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!roleId || isNaN(Number(roleId))) {
    errors.push('Valid Role ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUserUpdate = (data) => {
  const errors = [];
  const { email, firstName, lastName, roleId } = data;

  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (firstName !== undefined && firstName.trim().length === 0) {
    errors.push('First name cannot be empty');
  }

  if (lastName !== undefined && lastName.trim().length === 0) {
    errors.push('Last name cannot be empty');
  }

  if (roleId !== undefined && isNaN(Number(roleId))) {
    errors.push('Valid Role ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePasswordReset = (data) => {
  const errors = [];
  const { newPassword } = data;

  if (!newPassword || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
