import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/types';
import { sendError } from '@/utils/helpers';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002':
        sendError(res, 'Bu kayıt zaten mevcut', 409, 'Duplicate entry');
        return;
      case 'P2025':
        sendError(res, 'Kayıt bulunamadı', 404, 'Record not found');
        return;
      case 'P2003':
        sendError(res, 'İlişkili kayıt bulunamadı', 400, 'Foreign key constraint failed');
        return;
      default:
        sendError(res, 'Veritabanı hatası', 500, prismaError.message);
        return;
    }
  }

  // Prisma validation errors
  if (err.name === 'PrismaClientValidationError') {
    sendError(res, 'Geçersiz veri formatı', 400, err.message);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Geçersiz token', 401, err.message);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token süresi dolmuş', 401, err.message);
    return;
  }

  // Custom app errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.message);
    return;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    sendError(res, 'Doğrulama hatası', 400, err.message);
    return;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    const multerError = err as any;
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        sendError(res, 'Dosya boyutu çok büyük', 400, 'File too large');
        return;
      case 'LIMIT_FILE_COUNT':
        sendError(res, 'Çok fazla dosya', 400, 'Too many files');
        return;
      case 'LIMIT_UNEXPECTED_FILE':
        sendError(res, 'Beklenmeyen dosya alanı', 400, 'Unexpected file field');
        return;
      default:
        sendError(res, 'Dosya yükleme hatası', 400, multerError.message);
        return;
    }
  }

  // Default error
  sendError(
    res,
    process.env.NODE_ENV === 'production' 
      ? 'Sunucu hatası' 
      : err.message,
    500,
    process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.stack
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `${req.originalUrl} endpoint'i bulunamadı`, 404, 'Not found');
}; 