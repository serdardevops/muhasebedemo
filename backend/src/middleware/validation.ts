import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '@/utils/helpers';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors: Record<string, string[]> = {};
      
      error.details.forEach((detail) => {
        const field = detail.path.join('.');
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(detail.message);
      });

      sendError(res, 'Doğrulama hatası', 400, undefined, errors);
      return;
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors: Record<string, string[]> = {};
      
      error.details.forEach((detail) => {
        const field = detail.path.join('.');
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(detail.message);
      });

      sendError(res, 'Sorgu parametresi doğrulama hatası', 400, undefined, errors);
      return;
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errors: Record<string, string[]> = {};
      
      error.details.forEach((detail) => {
        const field = detail.path.join('.');
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(detail.message);
      });

      sendError(res, 'Parametre doğrulama hatası', 400, undefined, errors);
      return;
    }

    next();
  };
}; 