import { Router } from 'express';
import { validate } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import * as authController from '@/controllers/auth';
import * as authValidation from '@/validations/auth';

const router = Router();

// Public routes
router.post('/register', validate(authValidation.registerSchema), authController.register);
router.post('/login', validate(authValidation.loginSchema), authController.login);
router.post('/forgot-password', validate(authValidation.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.getProfile);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(authValidation.updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(authValidation.changePasswordSchema), authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router; 