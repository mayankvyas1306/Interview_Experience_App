const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error.errors) {
            const errorMessages = error.errors.map((err) => err.message).join(" | ");
            return next(new AppError(errorMessages, 400));
        }
        next(error);
    }
};

module.exports = validate;
