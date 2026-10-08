/**
 * Application Logger
 */
export const logger = {
  info: (message, meta = '') => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = '') => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message, error = '') => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error?.stack || error);
  }
};
