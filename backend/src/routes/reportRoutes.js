import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/customers', reportController.getCustomerReport);
router.get('/leads', reportController.getLeadReport);
router.get('/opportunities', reportController.getOpportunityReport);
router.get('/pipeline', reportController.getPipelineReport);
router.get('/conversion', reportController.getConversionReport);
router.get('/user-activity', authorizeRoles('ADMIN', 'MANAGER'), reportController.getUserActivityReport);
router.get('/audit', authorizeRoles('ADMIN'), reportController.getAuditReport);

export default router;
