import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Get list of users (e.g. for assignment dropdowns by managers/admin, full list by admin)
router.get('/', userController.getUsers);
router.get('/roles', userController.getRoles);
router.get('/:id', userController.getUserById);

// Admin-only operations
router.post('/', authorizeRoles('ADMIN'), userController.createUser);
router.put('/:id', authorizeRoles('ADMIN'), userController.updateUser);
router.patch('/:id/toggle-status', authorizeRoles('ADMIN'), userController.toggleUserStatus);
router.post('/:id/reset-password', authorizeRoles('ADMIN'), userController.resetUserPassword);

export default router;
