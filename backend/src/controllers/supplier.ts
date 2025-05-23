import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '@/types';
import { sendSuccess, sendError } from '@/utils/helpers';
import prisma from '@/utils/database';

// Get all suppliers
export const getSuppliers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const suppliers = await prisma.supplier.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, 'Tedarikçiler başarıyla getirildi', suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    sendError(res, 'Tedarikçiler getirilirken hata oluştu', 500);
  }
};

// Get supplier by ID
export const getSupplier = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const supplier = await prisma.supplier.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!supplier) {
      sendError(res, 'Tedarikçi bulunamadı', 404);
      return;
    }

    sendSuccess(res, 'Tedarikçi başarıyla getirildi', supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    sendError(res, 'Tedarikçi getirilirken hata oluştu', 500);
  }
};

// Create supplier
export const createSupplier = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const supplier = await prisma.supplier.create({
      data: {
        ...req.body,
        companyId: req.user.companyId,
      },
    });

    sendSuccess(res, 'Tedarikçi başarıyla oluşturuldu', supplier, 201);
  } catch (error) {
    console.error('Create supplier error:', error);
    sendError(res, 'Tedarikçi oluşturulurken hata oluştu', 500);
  }
};

// Update supplier
export const updateSupplier = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const supplier = await prisma.supplier.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!supplier) {
      sendError(res, 'Tedarikçi bulunamadı', 404);
      return;
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: req.body,
    });

    sendSuccess(res, 'Tedarikçi başarıyla güncellendi', updatedSupplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    sendError(res, 'Tedarikçi güncellenirken hata oluştu', 500);
  }
};

// Delete supplier
export const deleteSupplier = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const supplier = await prisma.supplier.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!supplier) {
      sendError(res, 'Tedarikçi bulunamadı', 404);
      return;
    }

    await prisma.supplier.delete({
      where: { id },
    });

    sendSuccess(res, 'Tedarikçi başarıyla silindi');
  } catch (error) {
    console.error('Delete supplier error:', error);
    sendError(res, 'Tedarikçi silinirken hata oluştu', 500);
  }
}; 