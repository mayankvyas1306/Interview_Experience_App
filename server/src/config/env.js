const requiredEnv = ["MONGO_URI","JWT_SECRET"];

const getEnv = (key,fallback)=>{
    const value = process.env[key];
    if(value!==undefined && value!==""){
        return value;
    }
    return fallback;
};

const validateEnv = () => {
    const missing = requiredEnv.filter((key)=>!getEnv(key));

    if(missing.length){
        throw new Error(
            `Missing required environment variables : ${missing.join(", ")}`,
        );
    }
};

const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: Number(getEnv("PORT", "5000")),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:3000"),
  JWT_COOKIE_NAME: getEnv("JWT_COOKIE_NAME", "token"),
  JWT_COOKIE_EXPIRES_DAYS: Number(getEnv("JWT_COOKIE_EXPIRES_DAYS", "7")),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_SECRET: getEnv("JWT_SECRET"),
};

module.exports = { env, validateEnv}