import { Router } from 'express';
import * as opportunityController from '../controllers/opportunityController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', opportunityController.getOpportunities);
router.get('/:id', opportunityController.getOpportunityById);
router.post('/', opportunityController.createOpportunity);
router.put('/:id', opportunityController.updateOpportunity);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), opportunityController.deleteOpportunity);

export default router;
