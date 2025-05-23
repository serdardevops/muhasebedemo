import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, message: string, data?: T | undefined, statusCode?: number) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, error?: string, errors?: Record<string, string[]>) => Response;
export declare const sendPaginatedResponse: <T>(res: Response, message: string, data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}, statusCode?: number) => Response;
export declare const getPaginationParams: (page?: string, limit?: string) => {
    page: number;
    limit: number;
    skip: number;
};
export declare const calculateTotalPages: (total: number, limit: number) => number;
export declare const generateInvoiceNumber: (prefix?: string) => string;
export declare const slugify: (text: string) => string;
export declare const formatDate: (date: Date, locale?: string) => string;
export declare const formatDateTime: (date: Date, locale?: string) => string;
export declare const formatCurrency: (amount: number, currency?: string, locale?: string) => string;
export declare const roundToTwo: (num: number) => number;
export declare const isValidEmail: (email: string) => boolean;
export declare const isValidTaxNumber: (taxNumber: string) => boolean;
export declare const getFileExtension: (filename: string) => string;
export declare const isValidImageFile: (mimetype: string) => boolean;
export declare const formatFileSize: (bytes: number) => string;
//# sourceMappingURL=helpers.d.ts.map