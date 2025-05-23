"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("@/middleware/validation");
const auth_1 = require("@/middleware/auth");
const authController = __importStar(require("@/controllers/auth"));
const authValidation = __importStar(require("@/validations/auth"));
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validate)(authValidation.registerSchema), authController.register);
router.post('/login', (0, validation_1.validate)(authValidation.loginSchema), authController.login);
router.post('/forgot-password', (0, validation_1.validate)(authValidation.forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', (0, validation_1.validate)(authValidation.resetPasswordSchema), authController.resetPassword);
router.get('/me', auth_1.authenticate, authController.getProfile);
router.get('/profile', auth_1.authenticate, authController.getProfile);
router.put('/profile', auth_1.authenticate, (0, validation_1.validate)(authValidation.updateProfileSchema), authController.updateProfile);
router.post('/change-password', auth_1.authenticate, (0, validation_1.validate)(authValidation.changePasswordSchema), authController.changePassword);
router.post('/logout', auth_1.authenticate, authController.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map