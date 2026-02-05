const User = require("../models/User");
const { clearAuthCookie, setAuthCookie } = require("../utils/authCookies");
const generateToken = require("../utils/generateToken");
const { setAuthCookie, clearAuthCookie } = require("../utils/authCookies");

const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, college, year } = req.body;

    if (!fullName || !email || !password) {
      res.status(400);
      throw new Error("Full name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exist with email");
    }

    const user = await User.create({
      fullName,
      email,
      password,
      college: college || "",
      year: year,
    });

    const token = generateToken(user._id); 
    console.log("Token is ",token);

    setAuthCookie(res, token);
    
    setAuthCookie(res,token);

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

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or Password");
    }

    const token=generateToken(user._id);
    console.log(token);

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
