import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ✅ CRITICAL FIX: Axios Request Interceptor with better token handling
// This interceptor runs before every request
api.interceptors.request.use(
  (config) => {
    //Browser automatically sends httpOnly cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Response Interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get 401 Unauthorized, user token is invalid
    if (error.response?.status === 401) {
      // Only redirect if we're not already on login page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/auth/login")) {
        localStorage.clear();
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);