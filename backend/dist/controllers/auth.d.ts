import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare const register: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const login: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const forgotPassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const resetPassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const logout: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map