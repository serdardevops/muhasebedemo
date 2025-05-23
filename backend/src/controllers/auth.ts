import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { AuthenticatedRequest, LoginRequest, RegisterRequest, AppError } from '@/types';
import { sendSuccess, sendError } from '@/utils/helpers';
import prisma from '@/utils/database';

// Generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT secret tanımlanmamış', 500);
  }

  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};

// Register new user
export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, companyName }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      sendError(res, 'Bu e-posta adresi zaten kullanılıyor', 409);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and company in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create company if provided
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

      // Create user
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

    // Generate token
    const token = generateToken(result.id, result.email, result.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;

    sendSuccess(res, 'Kullanıcı başarıyla oluşturuldu', {
      user: userWithoutPassword,
      token,
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    sendError(res, 'Kullanıcı oluşturulurken hata oluştu', 500);
  }
};

// Login user
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user with company
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      sendError(res, 'Geçersiz e-posta veya şifre', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Hesabınız devre dışı bırakılmış', 401);
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendError(res, 'Geçersiz e-posta veya şifre', 401);
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, 'Giriş başarılı', {
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Giriş yapılırken hata oluştu', 500);
  }
};

// Get user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Kullanıcı bilgisi bulunamadı', 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true },
    });

    if (!user) {
      sendError(res, 'Kullanıcı bulunamadı', 404);
      return;
    }

    sendSuccess(res, 'Profil bilgileri getirildi', user);
  } catch (error) {
    console.error('Get profile error:', error);
    sendError(res, 'Profil bilgileri getirilirken hata oluştu', 500);
  }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Kullanıcı bilgisi bulunamadı', 401);
      return;
    }

    const { firstName, lastName, email } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        sendError(res, 'Bu e-posta adresi zaten kullanılıyor', 409);
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
      },
      include: { company: true },
    });

    sendSuccess(res, 'Profil başarıyla güncellendi', updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    sendError(res, 'Profil güncellenirken hata oluştu', 500);
  }
};

// Change password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Kullanıcı bilgisi bulunamadı', 401);
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      sendError(res, 'Kullanıcı bulunamadı', 404);
      return;
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      sendError(res, 'Mevcut şifre yanlış', 400);
      return;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    sendSuccess(res, 'Şifre başarıyla değiştirildi');
  } catch (error) {
    console.error('Change password error:', error);
    sendError(res, 'Şifre değiştirilirken hata oluştu', 500);
  }
};

// Forgot password (placeholder)
export const forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success for security reasons
    sendSuccess(res, 'Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi');
    
    // TODO: Implement email sending logic
    if (user) {
      console.log(`Password reset requested for user: ${user.email}`);
      // Generate reset token and send email
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    sendError(res, 'Şifre sıfırlama isteği işlenirken hata oluştu', 500);
  }
};

// Reset password (placeholder)
export const resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    // TODO: Implement token validation and password reset logic
    sendError(res, 'Şifre sıfırlama özelliği henüz aktif değil', 501);
  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, 'Şifre sıfırlanırken hata oluştu', 500);
  }
};

// Logout (placeholder - for token blacklisting if needed)
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement token blacklisting if needed
    sendSuccess(res, 'Çıkış başarılı');
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'Çıkış yapılırken hata oluştu', 500);
  }
}; 