import { Response } from 'express';
import { AuthenticatedRequest, AppError } from '@/types';
import { sendSuccess, sendError } from '@/utils/helpers';
import prisma from '@/utils/database';
import { CashBook } from '@prisma/client';

// Get all cashbook entries
export const getCashBookEntries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const entries = await prisma.cashBook.findMany({
      where,
      include: {
        customer: true,
        supplier: true,
      },
      orderBy: { date: 'desc' },
    });

    sendSuccess(res, 'Kasa defteri kayıtları başarıyla getirildi', entries);
  } catch (error) {
    console.error('Get cashbook entries error:', error);
    sendError(res, 'Kasa defteri kayıtları getirilirken hata oluştu', 500);
  }
};

// Get cashbook entry by ID
export const getCashBookEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const entry = await prisma.cashBook.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
      include: {
        customer: true,
        supplier: true,
      },
    });

    if (!entry) {
      sendError(res, 'Kasa defteri kaydı bulunamadı', 404);
      return;
    }

    sendSuccess(res, 'Kasa defteri kaydı başarıyla getirildi', entry);
  } catch (error) {
    console.error('Get cashbook entry error:', error);
    sendError(res, 'Kasa defteri kaydı getirilirken hata oluştu', 500);
  }
};

// Get current cash balance
export const getCashBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    // Get the latest entry to get current balance
    const latestEntry = await prisma.cashBook.findFirst({
      where: { companyId: req.user.companyId },
      orderBy: { date: 'desc' },
    });

    const currentBalance = latestEntry?.balance || 0;

    // Get today's entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEntries = await prisma.cashBook.findMany({
      where: {
        companyId: req.user.companyId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { date: 'desc' },
    });

    const todayIncome = todayEntries
      .filter((entry: CashBook) => entry.type === 'CASH_IN')
      .reduce((sum: number, entry: CashBook) => sum + entry.amount, 0);

    const todayExpense = todayEntries
      .filter((entry: CashBook) => entry.type === 'CASH_OUT')
      .reduce((sum: number, entry: CashBook) => sum + entry.amount, 0);

    sendSuccess(res, 'Kasa bakiyesi başarıyla getirildi', {
      currentBalance,
      todayIncome,
      todayExpense,
      todayNet: todayIncome - todayExpense,
      todayEntries: todayEntries.length,
    });
  } catch (error) {
    console.error('Get cash balance error:', error);
    sendError(res, 'Kasa bakiyesi getirilirken hata oluştu', 500);
  }
};

// Create cashbook entry
export const createCashBookEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('=== CREATE CASHBOOK ENTRY DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    if (!req.user?.companyId) {
      console.log('ERROR: No company ID found');
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const { type, amount, description, date, category, reference, notes, customerId, supplierId } = req.body;

    // Get current balance
    const latestEntry = await prisma.cashBook.findFirst({
      where: { companyId: req.user.companyId },
      orderBy: { date: 'desc' },
    });

    const currentBalance = latestEntry?.balance || 0;
    
    // Calculate new balance
    const newBalance = type === 'CASH_IN' 
      ? currentBalance + parseFloat(amount)
      : currentBalance - parseFloat(amount);

    // Check if cash out amount exceeds balance
    if (type === 'CASH_OUT' && newBalance < 0) {
      sendError(res, 'Yetersiz kasa bakiyesi. Mevcut bakiye: ₺' + currentBalance.toLocaleString(), 400);
      return;
    }

    const entryData = {
      type,
      amount: parseFloat(amount),
      description,
      date: new Date(date),
      category: category || null,
      reference: reference || null,
      notes: notes || null,
      balance: newBalance,
      companyId: req.user.companyId,
      userId: req.user.id,
      customerId: customerId || null,
      supplierId: supplierId || null,
    };
    
    console.log('Cashbook entry data to create:', entryData);

    const entry = await prisma.cashBook.create({
      data: entryData,
      include: {
        customer: true,
        supplier: true,
      },
    });

    console.log('Cashbook entry created successfully:', entry);
    sendSuccess(res, 'Kasa defteri kaydı başarıyla oluşturuldu', entry, 201);
  } catch (error) {
    console.error('Create cashbook entry error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    sendError(res, 'Kasa defteri kaydı oluşturulurken hata oluştu', 500);
  }
};

// Update cashbook entry
export const updateCashBookEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const existingEntry = await prisma.cashBook.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!existingEntry) {
      sendError(res, 'Kasa defteri kaydı bulunamadı', 404);
      return;
    }

    // Recalculate balance for all entries after this one
    const { type, amount } = req.body;
    const oldAmount = existingEntry.amount;
    const oldType = existingEntry.type;
    const newAmount = parseFloat(amount);

    // Calculate balance difference
    let balanceDifference = 0;
    
    if (oldType === 'CASH_IN' && type === 'CASH_IN') {
      balanceDifference = newAmount - oldAmount;
    } else if (oldType === 'CASH_OUT' && type === 'CASH_OUT') {
      balanceDifference = oldAmount - newAmount;
    } else if (oldType === 'CASH_IN' && type === 'CASH_OUT') {
      balanceDifference = -(oldAmount + newAmount);
    } else if (oldType === 'CASH_OUT' && type === 'CASH_IN') {
      balanceDifference = oldAmount + newAmount;
    }

    const newBalance = existingEntry.balance + balanceDifference;

    const updatedEntry = await prisma.cashBook.update({
      where: { id },
      data: {
        ...req.body,
        amount: newAmount,
        balance: newBalance,
      },
      include: {
        customer: true,
        supplier: true,
      },
    });

    // Update all subsequent entries' balances
    await prisma.cashBook.updateMany({
      where: {
        companyId: req.user.companyId,
        date: {
          gt: existingEntry.date,
        },
      },
      data: {
        balance: {
          increment: balanceDifference,
        },
      },
    });

    sendSuccess(res, 'Kasa defteri kaydı başarıyla güncellendi', updatedEntry);
  } catch (error) {
    console.error('Update cashbook entry error:', error);
    sendError(res, 'Kasa defteri kaydı güncellenirken hata oluştu', 500);
  }
};

// Delete cashbook entry
export const deleteCashBookEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user?.companyId) {
      sendError(res, 'Şirket bilgisi bulunamadı', 400);
      return;
    }

    const entry = await prisma.cashBook.findFirst({
      where: { 
        id,
        companyId: req.user.companyId 
      },
    });

    if (!entry) {
      sendError(res, 'Kasa defteri kaydı bulunamadı', 404);
      return;
    }

    // Calculate balance adjustment for subsequent entries
    const balanceAdjustment = entry.type === 'CASH_IN' ? -entry.amount : entry.amount;

    // Update all subsequent entries' balances
    await prisma.cashBook.updateMany({
      where: {
        companyId: req.user.companyId,
        date: {
          gt: entry.date,
        },
      },
      data: {
        balance: {
          increment: balanceAdjustment,
        },
      },
    });

    await prisma.cashBook.delete({
      where: { id },
    });

    sendSuccess(res, 'Kasa defteri kaydı başarıyla silindi');
  } catch (error) {
    console.error('Delete cashbook entry error:', error);
    sendError(res, 'Kasa defteri kaydı silinirken hata oluştu', 500);
  }
};

interface CashBookGroupedStats {
  type: string;
  _sum: {
    amount: number | null;
  };
  _count: {
    id: number | null;
  };
}

// Get cashbook statistics
export const getCashBookStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const stats = await prisma.cashBook.groupBy({
      by: ['type'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalCashIn = stats.find((s: CashBookGroupedStats) => s.type === 'CASH_IN')?._sum.amount || 0;
    const totalCashOut = stats.find((s: CashBookGroupedStats) => s.type === 'CASH_OUT')?._sum.amount || 0;
    const netCash = totalCashIn - totalCashOut;

    // Get current balance
    const latestEntry = await prisma.cashBook.findFirst({
      where: { companyId: req.user.companyId },
      orderBy: { date: 'desc' },
    });

    const currentBalance = latestEntry?.balance || 0;

    sendSuccess(res, 'Kasa defteri istatistikleri başarıyla getirildi', {
      stats,
      totalCashIn,
      totalCashOut,
      netCash,
      currentBalance,
    });
  } catch (error) {
    console.error('Get cashbook stats error:', error);
    sendError(res, 'Kasa defteri istatistikleri getirilirken hata oluştu', 500);
  }
}; 