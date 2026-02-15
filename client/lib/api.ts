import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ✅ CRITICAL FIX: Axios Request Interceptor with better token handling
// This interceptor runs before every request
api.interceptors.request.use(
  (config) => {
    // typeof window !== "undefined" is needed because Next.js can run on server too
    if (typeof window !== "undefined") {
      // ✅ FIX: Always read fresh token from localStorage
      // This prevents stale tokens from being used after logout
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // ✅ FIX: If no token, remove Authorization header
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ NEW: Response Interceptor for handling auth errors
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