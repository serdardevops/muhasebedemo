import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const getProducts: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProduct: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createProduct: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deleteProduct: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getLowStockProducts: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateStock: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=product.d.ts.map