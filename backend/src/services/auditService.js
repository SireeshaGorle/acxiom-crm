import prisma from '../config/prisma.js';
import { logger } from '../utils/logger.js';

export const createAuditLog = async ({
  userId = null,
  userEmail = 'System/Anonymous',
  action,
  entity,
  recordId = null,
  oldValue = null,
  newValue = null,
  ipAddress = '127.0.0.1'
}) => {
  try {
    // Sanitization: sanitize old & new value objects to remove sensitive keys (passwords, tokens)
    const sanitize = (val) => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      const copy = { ...val };
      delete copy.password;
      delete copy.token;
      delete copy.jwtSecret;
      return JSON.stringify(copy);
    };

    const cleanOld = typeof oldValue === 'object' ? sanitize(oldValue) : (oldValue ? String(oldValue) : null);
    const cleanNew = typeof newValue === 'object' ? sanitize(newValue) : (newValue ? String(newValue) : null);

    const log = await prisma.auditLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        userEmail: String(userEmail || 'System'),
        action: String(action).toUpperCase(),
        entity: String(entity).toUpperCase(),
        recordId: recordId ? String(recordId) : null,
        oldValue: cleanOld,
        newValue: cleanNew,
        ipAddress: ipAddress || '127.0.0.1'
      }
    });

    return log;
  } catch (error) {
    // Audit logging failure should not crash main transaction, but should log an error
    logger.error('Failed to create audit log entry', error);
    return null;
  }
};
