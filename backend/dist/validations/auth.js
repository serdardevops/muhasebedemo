"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi gereklidir',
    }),
    password: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır',
        'any.required': 'Şifre gereklidir',
    }),
    firstName: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'Ad en az 2 karakter olmalıdır',
        'string.max': 'Ad en fazla 50 karakter olabilir',
        'any.required': 'Ad gereklidir',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'Soyad en az 2 karakter olmalıdır',
        'string.max': 'Soyad en fazla 50 karakter olabilir',
        'any.required': 'Soyad gereklidir',
    }),
    companyName: joi_1.default.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Şirket adı en az 2 karakter olmalıdır',
        'string.max': 'Şirket adı en fazla 100 karakter olabilir',
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi gereklidir',
    }),
    password: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Şifre gereklidir',
    }),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
        'any.required': 'E-posta adresi gereklidir',
    }),
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Reset token gereklidir',
    }),
    password: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Şifre en az 6 karakter olmalıdır',
        'any.required': 'Şifre gereklidir',
    }),
});
exports.updateProfileSchema = joi_1.default.object({
    firstName: joi_1.default.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.min': 'Ad en az 2 karakter olmalıdır',
        'string.max': 'Ad en fazla 50 karakter olabilir',
    }),
    lastName: joi_1.default.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
        'string.min': 'Soyad en az 2 karakter olmalıdır',
        'string.max': 'Soyad en fazla 50 karakter olabilir',
    }),
    email: joi_1.default.string()
        .email()
        .optional()
        .messages({
        'string.email': 'Geçerli bir e-posta adresi giriniz',
    }),
});
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Mevcut şifre gereklidir',
    }),
    newPassword: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Yeni şifre en az 6 karakter olmalıdır',
        'any.required': 'Yeni şifre gereklidir',
    }),
});
//# sourceMappingURL=auth.js.map