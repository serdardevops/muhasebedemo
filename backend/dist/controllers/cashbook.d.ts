import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const getCashBookEntries: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getCashBookEntry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getCashBalance: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createCashBookEntry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateCashBookEntry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteCashBookEntry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getCashBookStats: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=cashbook.d.ts.map