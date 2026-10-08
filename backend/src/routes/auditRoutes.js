import { Router } from 'express';
import * as auditController from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', auditController.getAuditLogs);

export default router;
