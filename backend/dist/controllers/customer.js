"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getCustomers = void 0;
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const getCustomers = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const customers = await database_1.default.customer.findMany({
            where: { companyId: req.user.companyId },
            orderBy: { createdAt: 'desc' },
        });
        (0, helpers_1.sendSuccess)(res, 'Müşteriler başarıyla getirildi', customers);
    }
    catch (error) {
        console.error('Get customers error:', error);
        (0, helpers_1.sendError)(res, 'Müşteriler getirilirken hata oluştu', 500);
    }
};
exports.getCustomers = getCustomers;
const getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const customer = await database_1.default.customer.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!customer) {
            (0, helpers_1.sendError)(res, 'Müşteri bulunamadı', 404);
            return;
        }
        (0, helpers_1.sendSuccess)(res, 'Müşteri başarıyla getirildi', customer);
    }
    catch (error) {
        console.error('Get customer error:', error);
        (0, helpers_1.sendError)(res, 'Müşteri getirilirken hata oluştu', 500);
    }
};
exports.getCustomer = getCustomer;
const createCustomer = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const customer = await database_1.default.customer.create({
            data: {
                ...req.body,
                companyId: req.user.companyId,
            },
        });
        (0, helpers_1.sendSuccess)(res, 'Müşteri başarıyla oluşturuldu', customer, 201);
    }
    catch (error) {
        console.error('Create customer error:', error);
        (0, helpers_1.sendError)(res, 'Müşteri oluşturulurken hata oluştu', 500);
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const customer = await database_1.default.customer.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!customer) {
            (0, helpers_1.sendError)(res, 'Müşteri bulunamadı', 404);
            return;
        }
        const updatedCustomer = await database_1.default.customer.update({
            where: { id },
            data: req.body,
        });
        (0, helpers_1.sendSuccess)(res, 'Müşteri başarıyla güncellendi', updatedCustomer);
    }
    catch (error) {
        console.error('Update customer error:', error);
        (0, helpers_1.sendError)(res, 'Müşteri güncellenirken hata oluştu', 500);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const customer = await database_1.default.customer.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!customer) {
            (0, helpers_1.sendError)(res, 'Müşteri bulunamadı', 404);
            return;
        }
        await database_1.default.customer.delete({
            where: { id },
        });
        (0, helpers_1.sendSuccess)(res, 'Müşteri başarıyla silindi');
    }
    catch (error) {
        console.error('Delete customer error:', error);
        (0, helpers_1.sendError)(res, 'Müşteri silinirken hata oluştu', 500);
    }
};
exports.deleteCustomer = deleteCustomer;
//# sourceMappingURL=customer.js.map