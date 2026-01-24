const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app =express();

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');

const { errorHandler, notFound } = require('./middlewares/error.middleware');

app.use(cors());//used to connect frontend or authorize frontend to access the backend
app.use(express.json());// parse into json format
app.use(morgan("dev"));//used to log each request used for debugging

app.use('/api/auth',authRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/users",userRoutes);

app.get('/',(req,res)=>{
    res.json({message:"Backend is running "});
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;