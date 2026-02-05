const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { env } = require("./config/env");

const app =express();

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const commentRoutes = require('./routes/comment.routes')
const analyticsRoutes = require("./routes/analytics.routes");
const adminRoutes = require("./routes/admin.routes");

const { errorHandler, notFound } = require('./middlewares/error.middleware');

const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    }),
);//used to connect frontend or authorize frontend to access the backend
app.use(express.json());// parse into json format
app.use(morgan("dev"));//used to log each request used for debugging

app.use(helmet()); // sets HTTP security headers

//Basic rate Limiting (prevents and block spam)
const limiter = rateLimit({
    windowMs: 15*60*1000, //15 minutes
    max:100, // max requests per IP in 15 minutes
    message: "Too many requests, please try again later",
});

app.use(limiter);


app.use('/api/auth',authRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/users",userRoutes);
app.use("/api/comments",commentRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/admin",adminRoutes);

app.get("/health",(req,res)=>{
    res.json({ status: "ok" });
});

app.get('/',(req,res)=>{
    res.json({message:"Backend is running "});
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
