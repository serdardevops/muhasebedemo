import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const getInvoices: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getInvoice: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createInvoice: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateInvoice: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteInvoice: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateInvoiceStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getInvoiceStats: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=invoice.d.ts.map