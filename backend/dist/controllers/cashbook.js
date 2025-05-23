"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashBookStats = exports.deleteCashBookEntry = exports.updateCashBookEntry = exports.createCashBookEntry = exports.getCashBalance = exports.getCashBookEntry = exports.getCashBookEntries = void 0;
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const getCashBookEntries = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const { type, startDate, endDate } = req.query;
        const where = { companyId: req.user.companyId };
        if (type) {
            where.type = type;
        }
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        const entries = await database_1.default.cashBook.findMany({
            where,
            include: {
                customer: true,
                supplier: true,
            },
            orderBy: { date: 'desc' },
        });
        (0, helpers_1.sendSuccess)(res, 'Kasa defteri kayıtları başarıyla getirildi', entries);
    }
    catch (error) {
        console.error('Get cashbook entries error:', error);
        (0, helpers_1.sendError)(res, 'Kasa defteri kayıtları getirilirken hata oluştu', 500);
    }
};
exports.getCashBookEntries = getCashBookEntries;
const getCashBookEntry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const entry = await database_1.default.cashBook.findFirst({
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
            (0, helpers_1.sendError)(res, 'Kasa defteri kaydı bulunamadı', 404);
            return;
        }
        (0, helpers_1.sendSuccess)(res, 'Kasa defteri kaydı başarıyla getirildi', entry);
    }
    catch (error) {
        console.error('Get cashbook entry error:', error);
        (0, helpers_1.sendError)(res, 'Kasa defteri kaydı getirilirken hata oluştu', 500);
    }
};
exports.getCashBookEntry = getCashBookEntry;
const getCashBalance = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const latestEntry = await database_1.default.cashBook.findFirst({
            where: { companyId: req.user.companyId },
            orderBy: { date: 'desc' },
        });
        const currentBalance = latestEntry?.balance || 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayEntries = await database_1.default.cashBook.findMany({
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
            .filter((entry) => entry.type === 'CASH_IN')
            .reduce((sum, entry) => sum + entry.amount, 0);
        const todayExpense = todayEntries
            .filter((entry) => entry.type === 'CASH_OUT')
            .reduce((sum, entry) => sum + entry.amount, 0);
        (0, helpers_1.sendSuccess)(res, 'Kasa bakiyesi başarıyla getirildi', {
            currentBalance,
            todayIncome,
            todayExpense,
            todayNet: todayIncome - todayExpense,
            todayEntries: todayEntries.length,
        });
    }
    catch (error) {
        console.error('Get cash balance error:', error);
        (0, helpers_1.sendError)(res, 'Kasa bakiyesi getirilirken hata oluştu', 500);
    }
};
exports.getCashBalance = getCashBalance;
const createCashBookEntry = async (req, res) => {
    try {
        console.log('=== CREATE CASHBOOK ENTRY DEBUG ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        if (!req.user?.companyId) {
            console.log('ERROR: No company ID found');
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const { type, amount, description, date, category, reference, notes, customerId, supplierId } = req.body;
        const latestEntry = await database_1.default.cashBook.findFirst({
            where: { companyId: req.user.companyId },
            orderBy: { date: 'desc' },
        });
        const currentBalance = latestEntry?.balance || 0;
        const newBalance = type === 'CASH_IN'
            ? currentBalance + parseFloat(amount)
            : currentBalance - parseFloat(amount);
        if (type === 'CASH_OUT' && newBalance < 0) {
            (0, helpers_1.sendError)(res, 'Yetersiz kasa bakiyesi. Mevcut bakiye: ₺' + currentBalance.toLocaleString(), 400);
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
        const entry = await database_1.default.cashBook.create({
            data: entryData,
            include: {
                customer: true,
                supplier: true,
            },
        });
        console.log('Cashbook entry created successfully:', entry);
        (0, helpers_1.sendSuccess)(res, 'Kasa defteri kaydı başarıyla oluşturuldu', entry, 201);
    }
    catch (error) {
        console.error('Create cashbook entry error:', error);
        console.error('Error details:', error instanceof Error ? error.message : error);
        (0, helpers_1.sendError)(res, 'Kasa defteri kaydı oluşturulurken hata oluştu', 500);
    }
};
exports.createCashBookEntry = createCashBookEntry;
const updateCashBookEntry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const existingEntry = await database_1.default.cashBook.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!existingEntry) {
            (0, helpers_1.sendError)(res, 'Kasa defteri kaydı bulunamadı', 404);
            return;
        }
        const { type, amount } = req.body;
        const oldAmount = existingEntry.amount;
        const oldType = existingEntry.type;
        const newAmount = parseFloat(amount);
        let balanceDifference = 0;
        if (oldType === 'CASH_IN' && type === 'CASH_IN') {
            balanceDifference = newAmount - oldAmount;
        }
        else if (oldType === 'CASH_OUT' && type === 'CASH_OUT') {
            balanceDifference = oldAmount - newAmount;
        }
        else if (oldType === 'CASH_IN' && type === 'CASH_OUT') {
            balanceDifference = -(oldAmount + newAmount);
        }
        else if (oldType === 'CASH_OUT' && type === 'CASH_IN') {
            balanceDifference = oldAmount + newAmount;
        }
        const newBalance = existingEntry.balance + balanceDifference;
        const updatedEntry = await database_1.default.cashBook.update({
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
        await database_1.default.cashBook.updateMany({
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
        (0, helpers_1.sendSuccess)(res, 'Kasa defteri kaydı başarıyla güncellendi', updatedEntry);
    }
    catch (error) {
        console.error('Update cashbook entry error:', error);
        (0, helpers_1.sendError)(res, 'Kasa defteri kaydı güncellenirken hata oluştu', 500);
    }
};
exports.updateCashBookEntry = updateCashBookEntry;
const deleteCashBookEntry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const entry = await database_1.default.cashBook.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!entry) {
            (0, helpers_1.sendError)(res, 'Kasa defteri kaydı bulunamadı', 404);
            return;
        }
        const balanceAdjustment = entry.type === 'CASH_IN' ? -entry.amount : entry.amount;
        await database_1.default.cashBook.updateMany({
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
        await database_1.default.cashBook.delete({
            where: { id },
        });
        (0, helpers_1.sendSuccess)(res, 'Kasa defteri kaydı başarıyla silindi');
    }
    catch (error) {
        console.error('Delete cashbook entry error:', error);
        (0, helpers_1.sendError)(res, 'Kasa defteri kaydı silinirken hata oluştu', 500);
    }
};
exports.deleteCashBookEntry = deleteCashBookEntry;
const getCashBookStats = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const { startDate, endDate } = req.query;
        const where = { companyId: req.user.companyId };
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        const stats = await database_1.default.cashBook.groupBy({
            by: ['type'],
            where,
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
        });
        const totalCashIn = stats.find((s) => s.type === 'CASH_IN')?._sum.amount || 0;
        const totalCashOut = stats.find((s) => s.type === 'CASH_OUT')?._sum.amount || 0;
        const netCash = totalCashIn - totalCashOut;
        const latestEntry = await database_1.default.cashBook.findFirst({
            where: { companyId: req.user.companyId },
            orderBy: { date: 'desc' },
        });
        const currentBalance = latestEntry?.balance || 0;
        (0, helpers_1.sendSuccess)(res, 'Kasa defteri istatistikleri başarıyla getirildi', {
            stats,
            totalCashIn,
            totalCashOut,
            netCash,
            currentBalance,
        });
    }
    catch (error) {
        console.error('Get cashbook stats error:', error);
        (0, helpers_1.sendError)(res, 'Kasa defteri istatistikleri getirilirken hata oluştu', 500);
    }
};
exports.getCashBookStats = getCashBookStats;
//# sourceMappingURL=cashbook.js.map