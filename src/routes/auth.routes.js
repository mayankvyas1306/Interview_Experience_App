const express = require("express");
const { registerUser, loginUser, getMe } = require("../controllers/auth.controller");
const router = express.Router();

router
    .post('/register',registerUser)
    .post('/login',loginUser)
    .get('/me',getMe);

module.exports = router;