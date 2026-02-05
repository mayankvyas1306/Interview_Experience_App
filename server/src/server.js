require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { env, validateEnv} = require("./config/env");


validateEnv();//validate whether you have all the urls in dot env or not
connectDB();

const PORT = env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
    
});