"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // ✅ Save token in browser storage
      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("fullName", res.data.user.fullName);

      login(res.data.token, res.data.user.fullName);
      
      localStorage.setItem("userId", res.data.user.id);
      

      toast.success("Login successful ✅");

      

      // ✅ Redirect after login
      setTimeout(() => {
        router.push("/explore");
      }, 700);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="glass glow-border p-4 p-md-5 rounded-4"
          >
            <div className="text-center mb-4">
              <div className="fs-2">
                <i className="bi bi-person-circle"></i>
              </div>
              <h2 className="fw-bold mt-2">Welcome back</h2>
              <p className="text-muted2 mb-0">
                Login to continue on <span className="fw-semibold">InterviewPulse</span>
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label text-muted2">Email</label>
                <input
                  type="email"
                  className="form-control bg-transparent text-light border-secondary"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted2">Password</label>
                <input
                  type="password"
                  className="form-control bg-transparent text-light border-secondary"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="btn btn-accent w-100 py-2 rounded-3"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted2">New here?</span>{" "}
              <Link href="/auth/register" className="text-decoration-none fw-semibold">
                Create account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
