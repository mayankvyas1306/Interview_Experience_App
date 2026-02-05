const { env } = require("../config/env");

const buildCookieOptions = () => {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: env.JWT_COOKIE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  };
};

const setAuthCookie = (res, token) => {
  res.cookie(env.JWT_COOKIE_NAME, token, buildCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(env.JWT_COOKIE_NAME, buildCookieOptions());
};

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name) {
      return acc;
    }
    acc[name] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});

module.exports = { setAuthCookie, clearAuthCookie, parseCookies };
