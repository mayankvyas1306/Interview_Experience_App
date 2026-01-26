"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");

    setToken(null);
    router.push("/auth/login");
  };

  const isActive = (href: string) => pathname === href;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="z-3"
      style={{ padding: "14px 0" }}
    >
      <div className="container">
        <div className="glass rounded-4 px-3 px-md-4 py-3 d-flex align-items-center justify-content-between">
          {/* Left: Brand */}
          <Link href="/" className="text-decoration-none text-light">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 38,
                  height: 38,
                  background:
                    "linear-gradient(120deg, rgba(109,94,249,1), rgba(0,212,255,1))",
                }}
              >
                <i className="bi bi-lightning-charge-fill"></i>
              </div>
              <div className="fw-bold fs-5">InterviewPulse</div>
            </div>
          </Link>

          {/* Center: Links */}
          <div className="d-none d-md-flex align-items-center gap-3">
            <Link
              href="/explore"
              className={`text-decoration-none px-3 py-2 rounded-3 ${
                isActive("/explore") ? "glass" : "text-muted2"
              }`}
            >
              Explore
            </Link>

            <Link
              href="/analytics"
              className={`text-decoration-none px-3 py-2 rounded-3 ${
                isActive("/analytics") ? "glass" : "text-muted2"
              }`}
            >
              Analytics
            </Link>

            <Link
              href="/create"
              className={`text-decoration-none px-3 py-2 rounded-3 ${
                isActive("/create") ? "glass" : "text-muted2"
              }`}
            >
              Share
            </Link>
          </div>

          {/* Right: Search + Auth */}
          <div className="d-flex align-items-center gap-2">
            <div className="d-none d-lg-flex align-items-center glass rounded-3 px-3 py-2">
              <i className="bi bi-search text-muted2"></i>
              <input
                className="bg-transparent border-0 text-light ms-2"
                placeholder="Search company..."
                style={{ outline: "none", width: 190 }}
              />
            </div>

            {token ? (
              <button
                onClick={handleLogout}
                className="btn btn-outline-light rounded-3"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="btn btn-outline-light rounded-3"
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  className="btn btn-accent rounded-3"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
