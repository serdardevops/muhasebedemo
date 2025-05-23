import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as cashbookController from '@/controllers/cashbook';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Cashbook CRUD routes
router.get('/', cashbookController.getCashBookEntries);
router.get('/balance', cashbookController.getCashBalance);
router.get('/stats', cashbookController.getCashBookStats);
router.get('/:id', cashbookController.getCashBookEntry);
router.post('/', cashbookController.createCashBookEntry);
router.put('/:id', cashbookController.updateCashBookEntry);
router.delete('/:id', cashbookController.deleteCashBookEntry);

export default router; 