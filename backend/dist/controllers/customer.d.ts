import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const getCustomers: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getCustomer: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createCustomer: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateCustomer: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteCustomer: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=customer.d.ts.map