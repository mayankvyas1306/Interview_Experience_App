"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  // const [token, setToken] = useState<string | null>(null);
  // const [fullName, setFullName] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ✅ Run on first load to check login state
  // not using instead creating context of it
  // useEffect(() => {
  //   const t = localStorage.getItem("token");
  //   const name = localStorage.getItem("fullName");

  //   setToken(t);
  //   setFullName(name);
  // }, []);

  const isActive = (href: string) => pathname === href;

  //Not using because we have logout from AuthContext
  // ✅ Logout = clear token + redirect
  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("userId");
  //   localStorage.removeItem("fullName");

  //   setToken(null);
  //   setFullName(null);

  //   router.push("/auth/login");
  // };

  // ✅ Search => redirect to explore with query params
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = search.trim();
    if (!trimmed) return;

    router.push(`/explore?company=${encodeURIComponent(trimmed)}`);
    setSearch("");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{ padding: "16px 0" }}
    >
      <div className="container">
        <div className="glass glow-border rounded-4 px-3 px-md-4 py-3">
          <div className="d-flex align-items-center justify-content-between gap-3">
            {/* ✅ Brand */}
            <Link href="/" className="text-decoration-none text-light">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: 42,
                    height: 42,
                    background:
                      "linear-gradient(120deg, rgba(109,94,249,1), rgba(0,212,255,1))",
                  }}
                >
                  <i className="bi bi-lightning-charge-fill fs-5"></i>
                </div>

                <div className="d-flex flex-column lh-1">
                  <span className="fw-bold fs-5">InterviewPulse</span>
                  <span className="text-muted2 small">
                    Share • Learn • Analyze
                  </span>
                </div>
              </div>
            </Link>

            {/* ✅ Desktop Links */}
            <div className="d-none d-md-flex align-items-center gap-2">
              <Link
                href="/explore"
                className={`text-decoration-none px-3 py-2 rounded-3 ${
                  isActive("/explore") ? "glass text-light" : "text-muted2"
                }`}
              >
                <i className="bi bi-compass me-2"></i>
                Explore
              </Link>

              <Link
                href="/analytics"
                className={`text-decoration-none px-3 py-2 rounded-3 ${
                  isActive("/analytics") ? "glass text-light" : "text-muted2"
                }`}
              >
                <i className="bi bi-graph-up-arrow me-2"></i>
                Analytics
              </Link>

              <Link
                href="/create"
                className={`text-decoration-none px-3 py-2 rounded-3 ${
                  isActive("/create") ? "glass text-light" : "text-muted2"
                }`}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Share
              </Link>
            </div>

            {/* ✅ Search */}
            <form
              onSubmit={handleSearch}
              className="d-none d-lg-flex align-items-center glass rounded-3 px-3 py-2"
              style={{ minWidth: 280 }}
            >
              <i className="bi bi-search text-muted2"></i>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-0 text-light ms-2"
                placeholder="Search company.."
                style={{ outline: "none", width: "100%" }}
              />
              <button
                type="submit"
                className="btn btn-sm btn-accent rounded-3 ms-2"
              >
                Go
              </button>
            </form>

            {/* ✅ Right actions */}
            <div className="d-flex align-items-center gap-2">
              {/* Mobile menu button */}
              <button
                className="btn btn-outline-light rounded-3 d-md-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navMobile"
              >
                <i className="bi bi-list"></i>
              </button>

              {user.token ? (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user.fullName?.split(" ")[0]}
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                    <li>
                      <Link className="dropdown-item" href="/profile">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={logout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <>
                  <Link href="/auth/login" className="btn btn-outline-light">
                    Login
                  </Link>
                  <Link href="/auth/register" className="btn btn-accent">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ✅ Mobile collapsed nav */}
          <div className="collapse mt-3 d-md-none" id="navMobile">
            <div className="glass rounded-4 p-3">
              <div className="d-flex flex-column gap-2">
                <Link
                  href="/explore"
                  className="btn btn-outline-light rounded-3 text-start"
                >
                  <i className="bi bi-compass me-2"></i> Explore
                </Link>
                <Link
                  href="/analytics"
                  className="btn btn-outline-light rounded-3 text-start"
                >
                  <i className="bi bi-graph-up-arrow me-2"></i> Analytics
                </Link>
                <Link
                  href="/create"
                  className="btn btn-outline-light rounded-3 text-start"
                >
                  <i className="bi bi-plus-circle me-2"></i> Share
                </Link>

                <form onSubmit={handleSearch} className="mt-2">
                  <div className="d-flex gap-2">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="form-control bg-transparent text-light border-secondary"
                      placeholder="Search company..."
                    />
                    <button className="btn btn-accent rounded-3" type="submit">
                      Go
                    </button>
                  </div>
                </form>

                {user.token && (
                  <button
                    onClick={logout}
                    className="btn btn-outline-danger rounded-3 mt-2"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
