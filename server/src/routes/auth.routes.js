const express = require("express");
const { registerUser, loginUser, getMe,logoutUser } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.schema");
const router = express.Router();

router
    .post('/register',validateBody(registerSchema),registerUser)
    .post('/login',validateBody(loginSchema),loginUser)
    .post('/logout',logoutUser)//todo implement logout
    .get('/me',protect,getMe);

module.exports = router;