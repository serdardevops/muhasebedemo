"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFileSize = exports.isValidImageFile = exports.getFileExtension = exports.isValidTaxNumber = exports.isValidEmail = exports.roundToTwo = exports.formatCurrency = exports.formatDateTime = exports.formatDate = exports.slugify = exports.generateInvoiceNumber = exports.calculateTotalPages = exports.getPaginationParams = exports.sendPaginatedResponse = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200) => {
    const response = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, error, errors) => {
    const response = {
        success: false,
        message,
        error,
        errors,
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendPaginatedResponse = (res, message, data, pagination, statusCode = 200) => {
    const response = {
        success: true,
        message,
        data,
        pagination,
    };
    return res.status(statusCode).json(response);
};
exports.sendPaginatedResponse = sendPaginatedResponse;
const getPaginationParams = (page, limit) => {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '10', 10);
    return {
        page: Math.max(1, pageNum),
        limit: Math.min(100, Math.max(1, limitNum)),
        skip: (Math.max(1, pageNum) - 1) * Math.min(100, Math.max(1, limitNum)),
    };
};
exports.getPaginationParams = getPaginationParams;
const calculateTotalPages = (total, limit) => {
    return Math.ceil(total / limit);
};
exports.calculateTotalPages = calculateTotalPages;
const generateInvoiceNumber = (prefix = 'INV') => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp.slice(-6)}-${random}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};
exports.slugify = slugify;
const formatDate = (date, locale = 'tr-TR') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
};
exports.formatDate = formatDate;
const formatDateTime = (date, locale = 'tr-TR') => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};
exports.formatDateTime = formatDateTime;
const formatCurrency = (amount, currency = 'TRY', locale = 'tr-TR') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const roundToTwo = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
};
exports.roundToTwo = roundToTwo;
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidTaxNumber = (taxNumber) => {
    const cleaned = taxNumber.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
};
exports.isValidTaxNumber = isValidTaxNumber;
const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};
exports.getFileExtension = getFileExtension;
const isValidImageFile = (mimetype) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(mimetype);
};
exports.isValidImageFile = isValidImageFile;
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
//# sourceMappingURL=helpers.js.map