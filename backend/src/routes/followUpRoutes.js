import { Router } from 'express';
import * as followUpController from '../controllers/followUpController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', followUpController.getFollowUps);
router.get('/:id', followUpController.getFollowUpById);
router.post('/', followUpController.createFollowUp);
router.put('/:id', followUpController.updateFollowUp);
router.delete('/:id', followUpController.deleteFollowUp);

export default router;
