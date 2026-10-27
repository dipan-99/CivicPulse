const { validationResult } = require('express-validator');

/**
 * Middleware that inspects express-validator results.
 * If errors are detected, responds with 400 and formatted error array.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return res.status(400).json({
            message: 'Validation failed: Please check your input fields',
            errors: formattedErrors
        });
    }
    next();
};

module.exports = validate;
