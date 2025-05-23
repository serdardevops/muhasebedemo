"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validate = void 0;
const helpers_1 = require("@/utils/helpers");
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach((detail) => {
                const field = detail.path.join('.');
                if (!errors[field]) {
                    errors[field] = [];
                }
                errors[field].push(detail.message);
            });
            (0, helpers_1.sendError)(res, 'Doğrulama hatası', 400, undefined, errors);
            return;
        }
        next();
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach((detail) => {
                const field = detail.path.join('.');
                if (!errors[field]) {
                    errors[field] = [];
                }
                errors[field].push(detail.message);
            });
            (0, helpers_1.sendError)(res, 'Sorgu parametresi doğrulama hatası', 400, undefined, errors);
            return;
        }
        next();
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach((detail) => {
                const field = detail.path.join('.');
                if (!errors[field]) {
                    errors[field] = [];
                }
                errors[field].push(detail.message);
            });
            (0, helpers_1.sendError)(res, 'Parametre doğrulama hatası', 400, undefined, errors);
            return;
        }
        next();
    };
};
exports.validateParams = validateParams;
//# sourceMappingURL=validation.js.map