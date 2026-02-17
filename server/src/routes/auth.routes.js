const express = require("express");
const { registerUser, loginUser, getMe, logoutUser } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validateZod.middleware");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");
const router = express.Router();

router
    .post('/register', validate(registerSchema), registerUser)
    .post('/login', validate(loginSchema), loginUser)
    .post('/logout', logoutUser)
    .get('/me', protect, getMe);

module.exports = router;
