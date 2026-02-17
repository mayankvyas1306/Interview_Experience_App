const User = require("../models/User");
const { clearAuthCookie, setAuthCookie } = require("../utils/authCookies");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");

const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, college, year } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exist with email", 400);
    }

    const user = await User.create({
      fullName,
      email,
      password,
      college: college || "",
      year: year,
    });

    const token = generateToken(user._id);

    setAuthCookie(res, token);

    res.status(201).json({
      message: "Registered Successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        college: user.college,
        year: user.year,
        role: user.role,
      },
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or Password", 401);
    }

    const token = generateToken(user._id);

    setAuthCookie(res, token);

    res.json({
      message: "Login Successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        college: user.college,
        year: user.year,
        role: user.role,
      },
      token: token,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        college: req.user.college,
        year: req.user.year,
        role: req.user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getMe, logoutUser };
