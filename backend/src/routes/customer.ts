import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as customerController from '@/controllers/customer';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer CRUD routes
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomer);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router; 