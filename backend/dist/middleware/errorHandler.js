"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const types_1 = require("@/types");
const helpers_1 = require("@/utils/helpers");
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
        switch (prismaError.code) {
            case 'P2002':
                (0, helpers_1.sendError)(res, 'Bu kayıt zaten mevcut', 409, 'Duplicate entry');
                return;
            case 'P2025':
                (0, helpers_1.sendError)(res, 'Kayıt bulunamadı', 404, 'Record not found');
                return;
            case 'P2003':
                (0, helpers_1.sendError)(res, 'İlişkili kayıt bulunamadı', 400, 'Foreign key constraint failed');
                return;
            default:
                (0, helpers_1.sendError)(res, 'Veritabanı hatası', 500, prismaError.message);
                return;
        }
    }
    if (err.name === 'PrismaClientValidationError') {
        (0, helpers_1.sendError)(res, 'Geçersiz veri formatı', 400, err.message);
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        (0, helpers_1.sendError)(res, 'Geçersiz token', 401, err.message);
        return;
    }
    if (err.name === 'TokenExpiredError') {
        (0, helpers_1.sendError)(res, 'Token süresi dolmuş', 401, err.message);
        return;
    }
    if (err instanceof types_1.AppError) {
        (0, helpers_1.sendError)(res, err.message, err.statusCode, err.message);
        return;
    }
    if (err.name === 'ValidationError') {
        (0, helpers_1.sendError)(res, 'Doğrulama hatası', 400, err.message);
        return;
    }
    if (err.name === 'MulterError') {
        const multerError = err;
        switch (multerError.code) {
            case 'LIMIT_FILE_SIZE':
                (0, helpers_1.sendError)(res, 'Dosya boyutu çok büyük', 400, 'File too large');
                return;
            case 'LIMIT_FILE_COUNT':
                (0, helpers_1.sendError)(res, 'Çok fazla dosya', 400, 'Too many files');
                return;
            case 'LIMIT_UNEXPECTED_FILE':
                (0, helpers_1.sendError)(res, 'Beklenmeyen dosya alanı', 400, 'Unexpected file field');
                return;
            default:
                (0, helpers_1.sendError)(res, 'Dosya yükleme hatası', 400, multerError.message);
                return;
        }
    }
    (0, helpers_1.sendError)(res, process.env.NODE_ENV === 'production'
        ? 'Sunucu hatası'
        : err.message, 500, process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.stack);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    (0, helpers_1.sendError)(res, `${req.originalUrl} endpoint'i bulunamadı`, 404, 'Not found');
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map