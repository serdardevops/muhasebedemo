import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const getTransactions: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTransaction: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createTransaction: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateTransaction: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteTransaction: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getTransactionStats: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getMonthlyStats: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=transaction.d.ts.map