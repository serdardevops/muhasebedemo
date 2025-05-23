import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '@/types';
import { sendSuccess, sendError } from '@/utils/helpers';
import prisma from '@/utils/database';

// Get all transactions
export const getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const { type, startDate, endDate } = req.query;
    
    const where: any = { companyId: req.user.companyId };
    
    if (type) {
      where.type = type;
    }
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        customer: true,
        supplier: true,
      },
      orderBy: { date: 'desc' },
    });

    sendSuccess(res, 'İşlemler başarıyla getirildi', transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    sendError(res, 'İşlemler getirilirken hata oluştu', 500);
  }
};

// Get transaction by ID
export const getTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
      include: {
        customer: true,
        supplier: true,
      },
    });

    if (!transaction) {
      sendError(res, 'İşlem bulunamadı', 404);
      return;
    }

    sendSuccess(res, 'İşlem başarıyla getirildi', transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    sendError(res, 'İşlem getirilirken hata oluştu', 500);
  }
};

// Create transaction
export const createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('=== CREATE TRANSACTION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    if (!req.user?.companyId) {
      console.log('ERROR: No company ID found');
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const transactionData = {
      ...req.body,
      companyId: req.user.companyId,
      userId: req.user.id,
    };
    
    console.log('Transaction data to create:', transactionData);

    const transaction = await prisma.transaction.create({
      data: transactionData,
      include: {
        customer: true,
        supplier: true,
      },
    });

    console.log('Transaction created successfully:', transaction);
    sendSuccess(res, 'İşlem başarıyla oluşturuldu', transaction, 201);
  } catch (error) {
    console.error('Create transaction error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    sendError(res, 'İşlem oluşturulurken hata oluştu', 500);
  }
};

// Update transaction
export const updateTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!transaction) {
      sendError(res, 'İşlem bulunamadı', 404);
      return;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: req.body,
      include: {
        customer: true,
        supplier: true,
      },
    });

    sendSuccess(res, 'İşlem başarıyla güncellendi', updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    sendError(res, 'İşlem güncellenirken hata oluştu', 500);
  }
};

// Delete transaction
export const deleteTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!transaction) {
      sendError(res, 'İşlem bulunamadı', 404);
      return;
    }

    await prisma.transaction.delete({
      where: { id },
    });

    sendSuccess(res, 'İşlem başarıyla silindi');
  } catch (error) {
    console.error('Delete transaction error:', error);
    sendError(res, 'İşlem silinirken hata oluştu', 500);
  }
};

// Get transaction statistics
export const getTransactionStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const { startDate, endDate } = req.query;
    
    const where: any = { companyId: req.user.companyId };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const stats = await prisma.transaction.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalIncome = stats.find(s => s.type === 'INCOME')?._sum.amount || 0;
    const totalExpense = stats.find(s => s.type === 'EXPENSE')?._sum.amount || 0;
    const netIncome = totalIncome - totalExpense;

    sendSuccess(res, 'İşlem istatistikleri başarıyla getirildi', {
      stats,
      totalIncome,
      totalExpense,
      netIncome,
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    sendError(res, 'İşlem istatistikleri getirilirken hata oluştu', 500);
  }
};

// Get monthly transaction summary
export const getMonthlyStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: req.user.companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
    });

    // Group by month
    const monthlyStats = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      income: 0,
      expense: 0,
      net: 0,
    }));

    transactions.forEach(transaction => {
      const month = transaction.date.getMonth();
      if (transaction.type === 'INCOME') {
        monthlyStats[month].income += transaction.amount;
      } else {
        monthlyStats[month].expense += transaction.amount;
      }
      monthlyStats[month].net = monthlyStats[month].income - monthlyStats[month].expense;
    });

    sendSuccess(res, 'Aylık istatistikler başarıyla getirildi', monthlyStats);
  } catch (error) {
    console.error('Get monthly stats error:', error);
    sendError(res, 'Aylık istatistikler getirilirken hata oluştu', 500);
  }
}; 