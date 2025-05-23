import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as supplierController from '@/controllers/supplier';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Supplier CRUD routes
router.get('/', supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplier);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

export default router; 