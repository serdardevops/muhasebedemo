import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as invoiceController from '@/controllers/invoice';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Invoice CRUD routes
router.get('/', invoiceController.getInvoices);
router.get('/stats', invoiceController.getInvoiceStats);
router.get('/:id', invoiceController.getInvoice);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.put('/:id/status', invoiceController.updateInvoiceStatus);
router.delete('/:id', invoiceController.deleteInvoice);

export default router; 