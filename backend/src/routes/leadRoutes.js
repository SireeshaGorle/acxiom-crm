import { Router } from 'express';
import * as leadController from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.post('/', leadController.createLead);
router.put('/:id', leadController.updateLead);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), leadController.deleteLead);
router.post('/:id/convert', leadController.convertLead);

export default router;
