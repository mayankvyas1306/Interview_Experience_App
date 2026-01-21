const User = require("../models/User");

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
    });
  } catch (err) {
    next(err);
  }
};

const loginuser = async (req, res, next) => {
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
    res.json({
      message: "Login Successful",
      use: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        college: user.college,
        year: user.year,
        role: user.role,
      },
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

module.exports = { registerUser, loginUser, getMe };