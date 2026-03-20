import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // httpOnly cookies are sent automatically by the browser
    // No manual token injection needed here
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on an auth page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth/")
      ) {
        localStorage.clear();
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Error message extractor ──────────────────────────────────────────────────
/**
 * Safely extracts a human-readable error message from an axios error.
 * Use this instead of err?.response?.data?.message everywhere.
 *
 * @example
 * try {
 *   await api.post('/posts', data);
 * } catch (err) {
 *   toast.error(getErrorMessage(err));
 * }
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string })?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}