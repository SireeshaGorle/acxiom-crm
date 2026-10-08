import app from './app.js';
import { config } from './config/env.js';
import prisma from './config/prisma.js';
import { logger } from './utils/logger.js';

const PORT = config.port;

const startServer = async () => {
  try {
    // Verify Database Connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL Database successfully via Prisma');

    const server = app.listen(PORT, () => {
      logger.info(`================================================`);
      logger.info(` ACXIOMCRM Backend Server running on port ${PORT}`);
      logger.info(` Environment: ${config.nodeEnv}`);
      logger.info(` API Health: http://localhost:${PORT}/api/health`);
      logger.info(`================================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      logger.info(`${signal} signal received. Closing HTTP server and Prisma client...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Prisma disconnected. Server terminated gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
