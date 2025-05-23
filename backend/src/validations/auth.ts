import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Şifre en az 6 karakter olmalıdır',
      'any.required': 'Şifre gereklidir',
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Ad en az 2 karakter olmalıdır',
      'string.max': 'Ad en fazla 50 karakter olabilir',
      'any.required': 'Ad gereklidir',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Soyad en az 2 karakter olmalıdır',
      'string.max': 'Soyad en fazla 50 karakter olabilir',
      'any.required': 'Soyad gereklidir',
    }),
  companyName: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Şirket adı en az 2 karakter olmalıdır',
      'string.max': 'Şirket adı en fazla 100 karakter olabilir',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Şifre gereklidir',
    }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
      'any.required': 'E-posta adresi gereklidir',
    }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token gereklidir',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Şifre en az 6 karakter olmalıdır',
      'any.required': 'Şifre gereklidir',
    }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Ad en az 2 karakter olmalıdır',
      'string.max': 'Ad en fazla 50 karakter olabilir',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Soyad en az 2 karakter olmalıdır',
      'string.max': 'Soyad en fazla 50 karakter olabilir',
    }),
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Geçerli bir e-posta adresi giriniz',
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Mevcut şifre gereklidir',
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Yeni şifre en az 6 karakter olmalıdır',
      'any.required': 'Yeni şifre gereklidir',
    }),
}); 