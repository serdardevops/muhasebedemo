import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '@/types';
import { sendSuccess, sendError } from '@/utils/helpers';
import prisma from '@/utils/database';

// Get all invoices
export const getInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const invoices = await prisma.invoice.findMany({
      where: { companyId: req.user.companyId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, 'Faturalar başarıyla getirildi', invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    sendError(res, 'Faturalar getirilirken hata oluştu', 500);
  }
};

// Get invoice by ID
export const getInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      sendError(res, 'Fatura bulunamadı', 404);
      return;
    }

    sendSuccess(res, 'Fatura başarıyla getirildi', invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    sendError(res, 'Fatura getirilirken hata oluştu', 500);
  }
};

// Create invoice
export const createInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const { items, ...invoiceData } = req.body;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + taxAmount;

    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const newInvoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          companyId: req.user!.companyId!,
          subtotal,
          taxAmount,
          total,
        },
      });

      // Create invoice items
      for (const item of items) {
        await tx.invoiceItem.create({
          data: {
            ...item,
            invoiceId: newInvoice.id,
          },
        });

        // Update product stock if it's a sale invoice
        if (invoiceData.type === 'SALE') {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newInvoice;
    });

    sendSuccess(res, 'Fatura başarıyla oluşturuldu', invoice, 201);
  } catch (error) {
    console.error('Create invoice error:', error);
    sendError(res, 'Fatura oluşturulurken hata oluştu', 500);
  }
};

// Update invoice
export const updateInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!invoice) {
      sendError(res, 'Fatura bulunamadı', 404);
      return;
    }

    if (invoice.status === 'PAID') {
      sendError(res, 'Ödenmiş fatura güncellenemez', 400);
      return;
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: req.body,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    sendSuccess(res, 'Fatura başarıyla güncellendi', updatedInvoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    sendError(res, 'Fatura güncellenirken hata oluştu', 500);
  }
};

// Delete invoice
export const deleteInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
      include: {
        items: true,
      },
    });

    if (!invoice) {
      sendError(res, 'Fatura bulunamadı', 404);
      return;
    }

    if (invoice.status === 'PAID') {
      sendError(res, 'Ödenmiş fatura silinemez', 400);
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Restore product stock if it's a sale invoice
      if (invoice.type === 'SALE') {
        for (const item of invoice.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Delete invoice items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Delete invoice
      await tx.invoice.delete({
        where: { id },
      });
    });

    sendSuccess(res, 'Fatura başarıyla silindi');
  } catch (error) {
    console.error('Delete invoice error:', error);
    sendError(res, 'Fatura silinirken hata oluştu', 500);
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const invoice = await prisma.invoice.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!invoice) {
      sendError(res, 'Fatura bulunamadı', 404);
      return;
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    sendSuccess(res, 'Fatura durumu başarıyla güncellendi', updatedInvoice);
  } catch (error) {
    console.error('Update invoice status error:', error);
    sendError(res, 'Fatura durumu güncellenirken hata oluştu', 500);
  }
};

// Get invoice statistics
export const getInvoiceStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const stats = await prisma.invoice.groupBy({
      by: ['status'],
      where: { companyId: req.user.companyId },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });

    const totalInvoices = await prisma.invoice.count({
      where: { companyId: req.user.companyId },
    });

    const totalAmount = await prisma.invoice.aggregate({
      where: { companyId: req.user.companyId },
      _sum: {
        total: true,
      },
    });

    sendSuccess(res, 'Fatura istatistikleri başarıyla getirildi', {
      stats,
      totalInvoices,
      totalAmount: totalAmount._sum.total || 0,
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    sendError(res, 'Fatura istatistikleri getirilirken hata oluştu', 500);
  }
}; 