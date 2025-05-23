"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSupplier = exports.getSuppliers = void 0;
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const getSuppliers = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const suppliers = await database_1.default.supplier.findMany({
            where: { companyId: req.user.companyId },
            orderBy: { createdAt: 'desc' },
        });
        (0, helpers_1.sendSuccess)(res, 'Tedarikçiler başarıyla getirildi', suppliers);
    }
    catch (error) {
        console.error('Get suppliers error:', error);
        (0, helpers_1.sendError)(res, 'Tedarikçiler getirilirken hata oluştu', 500);
    }
};
exports.getSuppliers = getSuppliers;
const getSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const supplier = await database_1.default.supplier.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!supplier) {
            (0, helpers_1.sendError)(res, 'Tedarikçi bulunamadı', 404);
            return;
        }
        (0, helpers_1.sendSuccess)(res, 'Tedarikçi başarıyla getirildi', supplier);
    }
    catch (error) {
        console.error('Get supplier error:', error);
        (0, helpers_1.sendError)(res, 'Tedarikçi getirilirken hata oluştu', 500);
    }
};
exports.getSupplier = getSupplier;
const createSupplier = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const supplier = await database_1.default.supplier.create({
            data: {
                ...req.body,
                companyId: req.user.companyId,
            },
        });
        (0, helpers_1.sendSuccess)(res, 'Tedarikçi başarıyla oluşturuldu', supplier, 201);
    }
    catch (error) {
        console.error('Create supplier error:', error);
        (0, helpers_1.sendError)(res, 'Tedarikçi oluşturulurken hata oluştu', 500);
    }
};
exports.createSupplier = createSupplier;
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const supplier = await database_1.default.supplier.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!supplier) {
            (0, helpers_1.sendError)(res, 'Tedarikçi bulunamadı', 404);
            return;
        }
        const updatedSupplier = await database_1.default.supplier.update({
            where: { id },
            data: req.body,
        });
        (0, helpers_1.sendSuccess)(res, 'Tedarikçi başarıyla güncellendi', updatedSupplier);
    }
    catch (error) {
        console.error('Update supplier error:', error);
        (0, helpers_1.sendError)(res, 'Tedarikçi güncellenirken hata oluştu', 500);
    }
};
exports.updateSupplier = updateSupplier;
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const supplier = await database_1.default.supplier.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!supplier) {
            (0, helpers_1.sendError)(res, 'Tedarikçi bulunamadı', 404);
            return;
        }
        await database_1.default.supplier.delete({
            where: { id },
        });
        (0, helpers_1.sendSuccess)(res, 'Tedarikçi başarıyla silindi');
    }
    catch (error) {
        console.error('Delete supplier error:', error);
        (0, helpers_1.sendError)(res, 'Tedarikçi silinirken hata oluştu', 500);
    }
};
exports.deleteSupplier = deleteSupplier;
//# sourceMappingURL=supplier.js.map