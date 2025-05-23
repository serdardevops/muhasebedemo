import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '@/types';
import { sendSuccess, sendError } from '@/utils/helpers';
import prisma from '@/utils/database';

// Get all customers
export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const customers = await prisma.customer.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, 'Müşteriler başarıyla getirildi', customers);
  } catch (error) {
    console.error('Get customers error:', error);
    sendError(res, 'Müşteriler getirilirken hata oluştu', 500);
  }
};

// Get customer by ID
export const getCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!customer) {
      sendError(res, 'Müşteri bulunamadı', 404);
      return;
    }

    sendSuccess(res, 'Müşteri başarıyla getirildi', customer);
  } catch (error) {
    console.error('Get customer error:', error);
    sendError(res, 'Müşteri getirilirken hata oluştu', 500);
  }
};

// Create customer
export const createCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        ...req.body,
        companyId: req.user.companyId,
      },
    });

    sendSuccess(res, 'Müşteri başarıyla oluşturuldu', customer, 201);
  } catch (error) {
    console.error('Create customer error:', error);
    sendError(res, 'Müşteri oluşturulurken hata oluştu', 500);
  }
};

// Update customer
export const updateCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!customer) {
      sendError(res, 'Müşteri bulunamadı', 404);
      return;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: req.body,
    });

    sendSuccess(res, 'Müşteri başarıyla güncellendi', updatedCustomer);
  } catch (error) {
    console.error('Update customer error:', error);
    sendError(res, 'Müşteri güncellenirken hata oluştu', 500);
  }
};

// Delete customer
export const deleteCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const customer = await prisma.customer.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!customer) {
      sendError(res, 'Müşteri bulunamadı', 404);
      return;
    }

    await prisma.customer.delete({
      where: { id },
    });

    sendSuccess(res, 'Müşteri başarıyla silindi');
  } catch (error) {
    console.error('Delete customer error:', error);
    sendError(res, 'Müşteri silinirken hata oluştu', 500);
  }
}; 