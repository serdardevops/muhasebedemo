import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as productController from '@/controllers/product';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Product CRUD routes
router.get('/', productController.getProducts);
router.get('/low-stock', productController.getLowStockProducts);
router.get('/:id', productController.getProduct);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.put('/:id/stock', productController.updateStock);
router.delete('/:id', productController.deleteProduct);

export default router; 