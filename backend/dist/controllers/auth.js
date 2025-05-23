"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("@/types");
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const generateToken = (userId, email, role) => {
    if (!process.env.JWT_SECRET) {
        throw new types_1.AppError('JWT secret tanımlanmamış', 500);
    }
    return jsonwebtoken_1.default.sign({ userId, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, companyName } = req.body;
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            (0, helpers_1.sendError)(res, 'Bu e-posta adresi zaten kullanılıyor', 409);
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const result = await database_1.default.$transaction(async (tx) => {
            let company = null;
            if (companyName) {
                company = await tx.company.create({
                    data: {
                        name: companyName,
                        currency: 'TRY',
                        taxRate: 18.0,
                    },
                });
            }
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    companyId: company?.id,
                },
                include: {
                    company: true,
                },
            });
            return user;
        });
        const token = generateToken(result.id, result.email, result.role);
        const { password: _, ...userWithoutPassword } = result;
        (0, helpers_1.sendSuccess)(res, 'Kullanıcı başarıyla oluşturuldu', {
            user: userWithoutPassword,
            token,
        }, 201);
    }
    catch (error) {
        console.error('Register error:', error);
        (0, helpers_1.sendError)(res, 'Kullanıcı oluşturulurken hata oluştu', 500);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database_1.default.user.findUnique({
            where: { email },
            include: { company: true },
        });
        if (!user) {
            (0, helpers_1.sendError)(res, 'Geçersiz e-posta veya şifre', 401);
            return;
        }
        if (!user.isActive) {
            (0, helpers_1.sendError)(res, 'Hesabınız devre dışı bırakılmış', 401);
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            (0, helpers_1.sendError)(res, 'Geçersiz e-posta veya şifre', 401);
            return;
        }
        const token = generateToken(user.id, user.email, user.role);
        const { password: _, ...userWithoutPassword } = user;
        (0, helpers_1.sendSuccess)(res, 'Giriş başarılı', {
            user: userWithoutPassword,
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        (0, helpers_1.sendError)(res, 'Giriş yapılırken hata oluştu', 500);
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            (0, helpers_1.sendError)(res, 'Kullanıcı bilgisi bulunamadı', 401);
            return;
        }
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
            include: { company: true },
        });
        if (!user) {
            (0, helpers_1.sendError)(res, 'Kullanıcı bulunamadı', 404);
            return;
        }
        (0, helpers_1.sendSuccess)(res, 'Profil bilgileri getirildi', user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        (0, helpers_1.sendError)(res, 'Profil bilgileri getirilirken hata oluştu', 500);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            (0, helpers_1.sendError)(res, 'Kullanıcı bilgisi bulunamadı', 401);
            return;
        }
        const { firstName, lastName, email } = req.body;
        if (email && email !== req.user.email) {
            const existingUser = await database_1.default.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                (0, helpers_1.sendError)(res, 'Bu e-posta adresi zaten kullanılıyor', 409);
                return;
            }
        }
        const updatedUser = await database_1.default.user.update({
            where: { id: req.user.id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(email && { email }),
            },
            include: { company: true },
        });
        (0, helpers_1.sendSuccess)(res, 'Profil başarıyla güncellendi', updatedUser);
    }
    catch (error) {
        console.error('Update profile error:', error);
        (0, helpers_1.sendError)(res, 'Profil güncellenirken hata oluştu', 500);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            (0, helpers_1.sendError)(res, 'Kullanıcı bilgisi bulunamadı', 401);
            return;
        }
        const { currentPassword, newPassword } = req.body;
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            (0, helpers_1.sendError)(res, 'Kullanıcı bulunamadı', 404);
            return;
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            (0, helpers_1.sendError)(res, 'Mevcut şifre yanlış', 400);
            return;
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await database_1.default.user.update({
            where: { id: req.user.id },
            data: { password: hashedNewPassword },
        });
        (0, helpers_1.sendSuccess)(res, 'Şifre başarıyla değiştirildi');
    }
    catch (error) {
        console.error('Change password error:', error);
        (0, helpers_1.sendError)(res, 'Şifre değiştirilirken hata oluştu', 500);
    }
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        (0, helpers_1.sendSuccess)(res, 'Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi');
        if (user) {
            console.log(`Password reset requested for user: ${user.email}`);
        }
    }
    catch (error) {
        console.error('Forgot password error:', error);
        (0, helpers_1.sendError)(res, 'Şifre sıfırlama isteği işlenirken hata oluştu', 500);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        (0, helpers_1.sendError)(res, 'Şifre sıfırlama özelliği henüz aktif değil', 501);
    }
    catch (error) {
        console.error('Reset password error:', error);
        (0, helpers_1.sendError)(res, 'Şifre sıfırlanırken hata oluştu', 500);
    }
};
exports.resetPassword = resetPassword;
const logout = async (req, res) => {
    try {
        (0, helpers_1.sendSuccess)(res, 'Çıkış başarılı');
    }
    catch (error) {
        console.error('Logout error:', error);
        (0, helpers_1.sendError)(res, 'Çıkış yapılırken hata oluştu', 500);
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.js.map