import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as transactionController from '@/controllers/transaction';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Transaction CRUD routes
router.get('/', transactionController.getTransactions);
router.get('/stats', transactionController.getTransactionStats);
router.get('/monthly-stats', transactionController.getMonthlyStats);
router.get('/:id', transactionController.getTransaction);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router; 