import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '@/types';
import { sendSuccess, sendError } from '@/utils/helpers';
import prisma from '@/utils/database';

// Get all products
export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const products = await prisma.product.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, 'Ürünler başarıyla getirildi', products);
  } catch (error) {
    console.error('Get products error:', error);
    sendError(res, 'Ürünler getirilirken hata oluştu', 500);
  }
};

// Get product by ID
export const getProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const product = await prisma.product.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!product) {
      sendError(res, 'Ürün bulunamadı', 404);
      return;
    }

    sendSuccess(res, 'Ürün başarıyla getirildi', product);
  } catch (error) {
    console.error('Get product error:', error);
    sendError(res, 'Ürün getirilirken hata oluştu', 500);
  }
};

// Create product
export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const product = await prisma.product.create({
      data: {
        ...req.body,
        companyId: req.user.companyId,
      },
    });

    sendSuccess(res, 'Ürün başarıyla oluşturuldu', product, 201);
  } catch (error) {
    console.error('Create product error:', error);
    sendError(res, 'Ürün oluşturulurken hata oluştu', 500);
  }
};

// Update product
export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const product = await prisma.product.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!product) {
      sendError(res, 'Ürün bulunamadı', 404);
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    sendSuccess(res, 'Ürün başarıyla güncellendi', updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    sendError(res, 'Ürün güncellenirken hata oluştu', 500);
  }
};

// Delete product
export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const product = await prisma.product.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!product) {
      sendError(res, 'Ürün bulunamadı', 404);
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    sendSuccess(res, 'Ürün başarıyla silindi');
  } catch (error) {
    console.error('Delete product error:', error);
    sendError(res, 'Ürün silinirken hata oluştu', 500);
  }
};

// Get low stock products
export const getLowStockProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const products = await prisma.product.findMany({
      where: { 
        companyId: req.user.companyId,
        stock: {
          lte: prisma.product.fields.minStock
        }
      },
      orderBy: { stock: 'asc' },
    });

    sendSuccess(res, 'Düşük stoklu ürünler başarıyla getirildi', products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    sendError(res, 'Düşük stoklu ürünler getirilirken hata oluştu', 500);
  }
};

// Update product stock
export const updateStock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'add' or 'subtract'

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const product = await prisma.product.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!product) {
      sendError(res, 'Ürün bulunamadı', 404);
      return;
    }

    const newStock = type === 'add' 
      ? product.stock + quantity 
      : product.stock - quantity;

    if (newStock < 0) {
      sendError(res, 'Stok miktarı negatif olamaz', 400);
      return;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });

    sendSuccess(res, 'Stok başarıyla güncellendi', updatedProduct);
  } catch (error) {
    console.error('Update stock error:', error);
    sendError(res, 'Stok güncellenirken hata oluştu', 500);
  }
}; 