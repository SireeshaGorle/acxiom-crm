import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), customerController.deleteCustomer);

export default router;
