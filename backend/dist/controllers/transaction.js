"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyStats = exports.getTransactionStats = exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransaction = exports.getTransactions = void 0;
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const getTransactions = async (req, res) => {
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
        const transactions = await database_1.default.transaction.findMany({
            where,
            include: {
                customer: true,
                supplier: true,
            },
            orderBy: { date: 'desc' },
        });
        (0, helpers_1.sendSuccess)(res, 'İşlemler başarıyla getirildi', transactions);
    }
    catch (error) {
        console.error('Get transactions error:', error);
        (0, helpers_1.sendError)(res, 'İşlemler getirilirken hata oluştu', 500);
    }
};
exports.getTransactions = getTransactions;
const getTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const transaction = await database_1.default.transaction.findFirst({
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
            (0, helpers_1.sendError)(res, 'İşlem bulunamadı', 404);
            return;
        }
        (0, helpers_1.sendSuccess)(res, 'İşlem başarıyla getirildi', transaction);
    }
    catch (error) {
        console.error('Get transaction error:', error);
        (0, helpers_1.sendError)(res, 'İşlem getirilirken hata oluştu', 500);
    }
};
exports.getTransaction = getTransaction;
const createTransaction = async (req, res) => {
    try {
        console.log('=== CREATE TRANSACTION DEBUG ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        if (!req.user?.companyId) {
            console.log('ERROR: No company ID found');
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const transactionData = {
            ...req.body,
            companyId: req.user.companyId,
            userId: req.user.id,
        };
        console.log('Transaction data to create:', transactionData);
        const transaction = await database_1.default.transaction.create({
            data: transactionData,
            include: {
                customer: true,
                supplier: true,
            },
        });
        console.log('Transaction created successfully:', transaction);
        (0, helpers_1.sendSuccess)(res, 'İşlem başarıyla oluşturuldu', transaction, 201);
    }
    catch (error) {
        console.error('Create transaction error:', error);
        console.error('Error details:', error instanceof Error ? error.message : error);
        (0, helpers_1.sendError)(res, 'İşlem oluşturulurken hata oluştu', 500);
    }
};
exports.createTransaction = createTransaction;
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const transaction = await database_1.default.transaction.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!transaction) {
            (0, helpers_1.sendError)(res, 'İşlem bulunamadı', 404);
            return;
        }
        const updatedTransaction = await database_1.default.transaction.update({
            where: { id },
            data: req.body,
            include: {
                customer: true,
                supplier: true,
            },
        });
        (0, helpers_1.sendSuccess)(res, 'İşlem başarıyla güncellendi', updatedTransaction);
    }
    catch (error) {
        console.error('Update transaction error:', error);
        (0, helpers_1.sendError)(res, 'İşlem güncellenirken hata oluştu', 500);
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const transaction = await database_1.default.transaction.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!transaction) {
            (0, helpers_1.sendError)(res, 'İşlem bulunamadı', 404);
            return;
        }
        await database_1.default.transaction.delete({
            where: { id },
        });
        (0, helpers_1.sendSuccess)(res, 'İşlem başarıyla silindi');
    }
    catch (error) {
        console.error('Delete transaction error:', error);
        (0, helpers_1.sendError)(res, 'İşlem silinirken hata oluştu', 500);
    }
};
exports.deleteTransaction = deleteTransaction;
const getTransactionStats = async (req, res) => {
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
        const stats = await database_1.default.transaction.groupBy({
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
        (0, helpers_1.sendSuccess)(res, 'İşlem istatistikleri başarıyla getirildi', {
            stats,
            totalIncome,
            totalExpense,
            netIncome,
        });
    }
    catch (error) {
        console.error('Get transaction stats error:', error);
        (0, helpers_1.sendError)(res, 'İşlem istatistikleri getirilirken hata oluştu', 500);
    }
};
exports.getTransactionStats = getTransactionStats;
const getMonthlyStats = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const { year } = req.query;
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);
        const transactions = await database_1.default.transaction.findMany({
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
            }
            else {
                monthlyStats[month].expense += transaction.amount;
            }
            monthlyStats[month].net = monthlyStats[month].income - monthlyStats[month].expense;
        });
        (0, helpers_1.sendSuccess)(res, 'Aylık istatistikler başarıyla getirildi', monthlyStats);
    }
    catch (error) {
        console.error('Get monthly stats error:', error);
        (0, helpers_1.sendError)(res, 'Aylık istatistikler getirilirken hata oluştu', 500);
    }
};
exports.getMonthlyStats = getMonthlyStats;
//# sourceMappingURL=transaction.js.map