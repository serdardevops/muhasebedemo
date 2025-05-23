"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = __importDefault(require("@/routes/auth"));
const customer_1 = __importDefault(require("@/routes/customer"));
const supplier_1 = __importDefault(require("@/routes/supplier"));
const product_1 = __importDefault(require("@/routes/product"));
const invoice_1 = __importDefault(require("@/routes/invoice"));
const transaction_1 = __importDefault(require("@/routes/transaction"));
const cashbook_1 = __importDefault(require("@/routes/cashbook"));
const seedData_1 = require("@/utils/seedData");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/customers', customer_1.default);
app.use('/api/suppliers', supplier_1.default);
app.use('/api/products', product_1.default);
app.use('/api/invoices', invoice_1.default);
app.use('/api/transactions', transaction_1.default);
app.use('/api/cashbook', cashbook_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔒 LOCALHOST ONLY - No external access allowed`);
    if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
        console.log(`🌐 Frontend: http://localhost:3000`);
        try {
            await (0, seedData_1.seedDemoData)();
        }
        catch (error) {
            console.error('Demo verileri oluşturulamadı:', error);
        }
    }
});
exports.default = app;
//# sourceMappingURL=index.js.map