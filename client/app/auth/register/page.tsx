"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const {login} = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState(1);

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error("Full name, email and password are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        fullName,
        email,
        password,
        college,
        year,
      });

      // localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      // localStorage.setItem("fullName", res.data.user.fullName);
      login({
        id: res.data.user.id,
        fullName: res.data.user.fullName,
        email: res.data.user.email,
        role: res.data.user.role,
        token: res.data.token,
      });


      toast.success("Account created ✅");

      setTimeout(() => {
        router.push("/explore");
      }, 700);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="glass glow-border p-4 p-md-5 rounded-4"
          >
            <div className="text-center mb-4">
              <div className="fs-2">
                <i className="bi bi-person-plus-fill"></i>
              </div>
              <h2 className="fw-bold mt-2">Create your account</h2>
              <p className="text-muted2 mb-0">
                Join <span className="fw-semibold">InterviewPulse</span> and share your story.
              </p>
            </div>

            <form onSubmit={handleRegister}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted2">Full Name</label>
                  <input
                    className="form-control bg-transparent text-light border-secondary"
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label text-muted2">Email</label>
                  <input
                    type="email"
                    className="form-control bg-transparent text-light border-secondary"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label text-muted2">Password</label>
                  <input
                    type="password"
                    className="form-control bg-transparent text-light border-secondary"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label text-muted2">College</label>
                  <input
                    className="form-control bg-transparent text-light border-secondary"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted2">Year</label>
                  <select
                    className="form-select bg-transparent text-light border-secondary"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    <option value={1}>1st</option>
                    <option value={2}>2nd</option>
                    <option value={3}>3rd</option>
                    <option value={4}>4th</option>
                  </select>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="btn btn-accent w-100 py-2 rounded-3 mt-4"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted2">Already have an account?</span>{" "}
              <Link href="/auth/login" className="text-decoration-none fw-semibold">
                Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
