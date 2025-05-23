"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
describe('Health Check', () => {
    it('should return health status', async () => {
        const response = await (0, supertest_1.default)(index_1.default)
            .get('/health')
            .expect(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Server is running');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment');
    });
});
//# sourceMappingURL=health.test.js.map