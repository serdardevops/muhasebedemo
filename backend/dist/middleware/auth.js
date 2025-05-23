"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("@/types");
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, helpers_1.sendError)(res, 'Yetkilendirme token\'ı gerekli', 401);
            return;
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            throw new types_1.AppError('JWT secret tanımlanmamış', 500);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: { company: true },
        });
        if (!user || !user.isActive) {
            (0, helpers_1.sendError)(res, 'Geçersiz token veya kullanıcı bulunamadı', 401);
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            (0, helpers_1.sendError)(res, 'Geçersiz token', 401);
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            (0, helpers_1.sendError)(res, 'Token süresi dolmuş', 401);
            return;
        }
        (0, helpers_1.sendError)(res, 'Yetkilendirme hatası', 500);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, helpers_1.sendError)(res, 'Kullanıcı bilgisi bulunamadı', 401);
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, helpers_1.sendError)(res, 'Bu işlem için yetkiniz bulunmuyor', 403);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            next();
            return;
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            next();
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: { company: true },
        });
        if (user && user.isActive) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map