import { Router } from 'express';
import authRoutes from './authRoutes.js';
import customerRoutes from './customerRoutes.js';
import leadRoutes from './leadRoutes.js';
import opportunityRoutes from './opportunityRoutes.js';
import followUpRoutes from './followUpRoutes.js';
import activityRoutes from './activityRoutes.js';
import userRoutes from './userRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';
import auditRoutes from './auditRoutes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ACXIOMCRM API is up and running',
    timestamp: new Date().toISOString()
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/leads', leadRoutes);
apiRouter.use('/opportunities', opportunityRoutes);
apiRouter.use('/followups', followUpRoutes);
apiRouter.use('/activities', activityRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/audit-logs', auditRoutes);

export default apiRouter;
