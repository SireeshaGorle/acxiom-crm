/**
 * Sequential entity code generator
 */
export const generateCode = (prefix, count) => {
  const padded = String(count + 1).padStart(4, '0');
  return `${prefix}-${padded}`;
};
