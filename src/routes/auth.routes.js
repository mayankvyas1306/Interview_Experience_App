const express = require("express");
const { registerUser, loginUser, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const router = express.Router();

router
    .post('/register',registerUser)
    .post('/login',loginUser)
    .get('/me',protect,getMe);

module.exports = router;