"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = exports.getLowStockProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const helpers_1 = require("@/utils/helpers");
const database_1 = __importDefault(require("@/utils/database"));
const getProducts = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const products = await database_1.default.product.findMany({
            where: { companyId: req.user.companyId },
            orderBy: { createdAt: 'desc' },
        });
        (0, helpers_1.sendSuccess)(res, 'Ürünler başarıyla getirildi', products);
    }
    catch (error) {
        console.error('Get products error:', error);
        (0, helpers_1.sendError)(res, 'Ürünler getirilirken hata oluştu', 500);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const product = await database_1.default.product.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!product) {
            (0, helpers_1.sendError)(res, 'Ürün bulunamadı', 404);
            return;
        }
        (0, helpers_1.sendSuccess)(res, 'Ürün başarıyla getirildi', product);
    }
    catch (error) {
        console.error('Get product error:', error);
        (0, helpers_1.sendError)(res, 'Ürün getirilirken hata oluştu', 500);
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const product = await database_1.default.product.create({
            data: {
                ...req.body,
                companyId: req.user.companyId,
            },
        });
        (0, helpers_1.sendSuccess)(res, 'Ürün başarıyla oluşturuldu', product, 201);
    }
    catch (error) {
        console.error('Create product error:', error);
        (0, helpers_1.sendError)(res, 'Ürün oluşturulurken hata oluştu', 500);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const product = await database_1.default.product.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!product) {
            (0, helpers_1.sendError)(res, 'Ürün bulunamadı', 404);
            return;
        }
        const updatedProduct = await database_1.default.product.update({
            where: { id },
            data: req.body,
        });
        (0, helpers_1.sendSuccess)(res, 'Ürün başarıyla güncellendi', updatedProduct);
    }
    catch (error) {
        console.error('Update product error:', error);
        (0, helpers_1.sendError)(res, 'Ürün güncellenirken hata oluştu', 500);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const product = await database_1.default.product.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!product) {
            (0, helpers_1.sendError)(res, 'Ürün bulunamadı', 404);
            return;
        }
        await database_1.default.product.delete({
            where: { id },
        });
        (0, helpers_1.sendSuccess)(res, 'Ürün başarıyla silindi');
    }
    catch (error) {
        console.error('Delete product error:', error);
        (0, helpers_1.sendError)(res, 'Ürün silinirken hata oluştu', 500);
    }
};
exports.deleteProduct = deleteProduct;
const getLowStockProducts = async (req, res) => {
    try {
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const products = await database_1.default.product.findMany({
            where: {
                companyId: req.user.companyId,
                stock: {
                    lte: database_1.default.product.fields.minStock
                }
            },
            orderBy: { stock: 'asc' },
        });
        (0, helpers_1.sendSuccess)(res, 'Düşük stoklu ürünler başarıyla getirildi', products);
    }
    catch (error) {
        console.error('Get low stock products error:', error);
        (0, helpers_1.sendError)(res, 'Düşük stoklu ürünler getirilirken hata oluştu', 500);
    }
};
exports.getLowStockProducts = getLowStockProducts;
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type } = req.body;
        if (!req.user?.companyId) {
            (0, helpers_1.sendError)(res, 'Şirket bilgisi bulunamadı', 400);
            return;
        }
        const product = await database_1.default.product.findFirst({
            where: {
                id,
                companyId: req.user.companyId
            },
        });
        if (!product) {
            (0, helpers_1.sendError)(res, 'Ürün bulunamadı', 404);
            return;
        }
        const newStock = type === 'add'
            ? product.stock + quantity
            : product.stock - quantity;
        if (newStock < 0) {
            (0, helpers_1.sendError)(res, 'Stok miktarı negatif olamaz', 400);
            return;
        }
        const updatedProduct = await database_1.default.product.update({
            where: { id },
            data: { stock: newStock },
        });
        (0, helpers_1.sendSuccess)(res, 'Stok başarıyla güncellendi', updatedProduct);
    }
    catch (error) {
        console.error('Update stock error:', error);
        (0, helpers_1.sendError)(res, 'Stok güncellenirken hata oluştu', 500);
    }
};
exports.updateStock = updateStock;
//# sourceMappingURL=product.js.map