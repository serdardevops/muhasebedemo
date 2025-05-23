"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoiceStats = exports.updateInvoiceStatus = exports.deleteInvoice = exports.updateInvoice = exports.createInvoice = exports.getInvoice = exports.getInvoices = void 0;
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const getInvoices = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const invoices = await database_1.default.invoice.findMany({
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
        (0, helpers_1.sendSuccess)(res, 'Faturalar başarıyla getirildi', invoices);
    }
    catch (error) {
        console.error('Get invoices error:', error);
        (0, helpers_1.sendError)(res, 'Faturalar getirilirken hata oluştu', 500);
    }
};
exports.getInvoices = getInvoices;
const getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const invoice = await database_1.default.invoice.findFirst({
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
            (0, helpers_1.sendError)(res, 'Fatura bulunamadı', 404);
            return;
        }
        (0, helpers_1.sendSuccess)(res, 'Fatura başarıyla getirildi', invoice);
    }
    catch (error) {
        console.error('Get invoice error:', error);
        (0, helpers_1.sendError)(res, 'Fatura getirilirken hata oluştu', 500);
    }
};
exports.getInvoice = getInvoice;
const createInvoice = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const { items, ...invoiceData } = req.body;
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.quantity * item.unitPrice;
        }
        const taxAmount = subtotal * (invoiceData.taxRate / 100);
        const total = subtotal + taxAmount;
        const invoice = await database_1.default.$transaction(async (tx) => {
            const newInvoice = await tx.invoice.create({
                data: {
                    ...invoiceData,
                    companyId: req.user.companyId,
                    subtotal,
                    taxAmount,
                    total,
                },
            });
            for (const item of items) {
                await tx.invoiceItem.create({
                    data: {
                        ...item,
                        invoiceId: newInvoice.id,
                    },
                });
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
        (0, helpers_1.sendSuccess)(res, 'Fatura başarıyla oluşturuldu', invoice, 201);
    }
    catch (error) {
        console.error('Create invoice error:', error);
        (0, helpers_1.sendError)(res, 'Fatura oluşturulurken hata oluştu', 500);
    }
};
exports.createInvoice = createInvoice;
const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!invoice) {
            (0, helpers_1.sendError)(res, 'Fatura bulunamadı', 404);
            return;
        }
        if (invoice.status === 'PAID') {
            (0, helpers_1.sendError)(res, 'Ödenmiş fatura güncellenemez', 400);
            return;
        }
        const updatedInvoice = await database_1.default.invoice.update({
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
        (0, helpers_1.sendSuccess)(res, 'Fatura başarıyla güncellendi', updatedInvoice);
    }
    catch (error) {
        console.error('Update invoice error:', error);
        (0, helpers_1.sendError)(res, 'Fatura güncellenirken hata oluştu', 500);
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
            include: {
                items: true,
            },
        });
        if (!invoice) {
            (0, helpers_1.sendError)(res, 'Fatura bulunamadı', 404);
            return;
        }
        if (invoice.status === 'PAID') {
            (0, helpers_1.sendError)(res, 'Ödenmiş fatura silinemez', 400);
            return;
        }
        await database_1.default.$transaction(async (tx) => {
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
            await tx.invoiceItem.deleteMany({
                where: { invoiceId: id },
            });
            await tx.invoice.delete({
                where: { id },
            });
        });
        (0, helpers_1.sendSuccess)(res, 'Fatura başarıyla silindi');
    }
    catch (error) {
        console.error('Delete invoice error:', error);
        (0, helpers_1.sendError)(res, 'Fatura silinirken hata oluştu', 500);
    }
};
exports.deleteInvoice = deleteInvoice;
const updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!invoice) {
            (0, helpers_1.sendError)(res, 'Fatura bulunamadı', 404);
            return;
        }
        const updatedInvoice = await database_1.default.invoice.update({
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
        (0, helpers_1.sendSuccess)(res, 'Fatura durumu başarıyla güncellendi', updatedInvoice);
    }
    catch (error) {
        console.error('Update invoice status error:', error);
        (0, helpers_1.sendError)(res, 'Fatura durumu güncellenirken hata oluştu', 500);
    }
};
exports.updateInvoiceStatus = updateInvoiceStatus;
const getInvoiceStats = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const stats = await database_1.default.invoice.groupBy({
            by: ['status'],
            where: { companyId: req.user.companyId },
            _sum: {
                total: true,
            },
            _count: {
                id: true,
            },
        });
        const totalInvoices = await database_1.default.invoice.count({
            where: { companyId: req.user.companyId },
        });
        const totalAmount = await database_1.default.invoice.aggregate({
            where: { companyId: req.user.companyId },
            _sum: {
                total: true,
            },
        });
        (0, helpers_1.sendSuccess)(res, 'Fatura istatistikleri başarıyla getirildi', {
            stats,
            totalInvoices,
            totalAmount: totalAmount._sum.total || 0,
        });
    }
    catch (error) {
        console.error('Get invoice stats error:', error);
        (0, helpers_1.sendError)(res, 'Fatura istatistikleri getirilirken hata oluştu', 500);
    }
};
exports.getInvoiceStats = getInvoiceStats;
//# sourceMappingURL=invoice.js.map