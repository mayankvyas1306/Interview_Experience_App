"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import Image from "next/image";

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/explore", label: "Explore", icon: "bi-compass" },
  { href: "/analytics", label: "Analytics", icon: "bi-graph-up-arrow" },
  { href: "/create", label: "Share", icon: "bi-plus-circle" },
  { href: "/ai-prep", label: "AI Prep", icon: "bi-stars" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) return;
    router.push(`/explore?company=${encodeURIComponent(trimmed)}`);
    setSearch("");
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ padding: "14px 0", position: "sticky", top: 0, zIndex: 100 }}
    >
      <div className="container">
        <div className="glass glow-border rounded-4 px-3 px-md-4 py-2">
          <div className="d-flex align-items-center justify-content-between gap-3">

            {/* ── Brand ── */}
            <Link
              href="/"
              className="text-decoration-none text-light d-flex align-items-center gap-2 flex-shrink-0"
            >
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  background: "linear-gradient(120deg, #6D5EF9, #00D4FF)",
                }}
              >
                <i className="bi bi-lightning-charge-fill text-white" />
              </div>
              <span className="fw-bold d-none d-sm-block" style={{ fontSize: "1.05rem" }}>
                InterviewPulse
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="d-none d-lg-flex align-items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-decoration-none px-3 py-2 rounded-3 d-flex align-items-center gap-2 transition-all ${isActive(link.href)
                      ? "text-light"
                      : "text-muted2"
                    }`}
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: isActive(link.href) ? 600 : 400,
                    background: isActive(link.href)
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <i className={`bi ${link.icon}`} />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Search ── */}
            <form
              onSubmit={handleSearch}
              className="d-none d-xl-flex align-items-center gap-2 glass-sm rounded-3 px-3 py-2 flex-grow-1"
              style={{ maxWidth: 280 }}
            >
              <i className="bi bi-search text-muted2" style={{ fontSize: "0.85rem" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-0 text-light w-100"
                placeholder="Search company..."
                style={{ outline: "none", fontSize: "0.875rem" }}
              />
            </form>

            {/* ── Right side actions ── */}
            <div className="d-flex align-items-center gap-2">
              {user && <NotificationBell />}

              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ borderRadius: 10, fontSize: "0.875rem" }}
                  >
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                      alt={user.fullName}
                      width={24}
                      height={24}
                      className="rounded-circle"
                      unoptimized
                    />
                    <span className="d-none d-sm-block">
                      {user.fullName.split(" ")[0]}
                    </span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" href="/profile">
                        <i className="bi bi-person me-2" />
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" href="/saved">
                        <i className="bi bi-bookmark me-2" />
                        Saved Posts
                      </Link>
                    </li>
                    {user.role === "admin" && (
                      <>
                        <li>
                          <hr className="dropdown-divider" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                        </li>
                        <li>
                          <Link className="dropdown-item" href="/admin">
                            <i className="bi bi-shield-check me-2" />
                            Admin Panel
                          </Link>
                        </li>
                      </>
                    )}
                    <li>
                      <hr className="dropdown-divider" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Link
                    href="/auth/login"
                    className="btn btn-sm btn-outline-light"
                    style={{ borderRadius: 10, fontSize: "0.875rem" }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn btn-sm btn-accent d-none d-sm-flex"
                    style={{ borderRadius: 10, fontSize: "0.875rem" }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="btn btn-sm btn-outline-secondary d-lg-none"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ borderRadius: 10, width: 36, height: 36, padding: 0 }}
                aria-label="Toggle menu"
              >
                <i className={`bi ${mobileOpen ? "bi-x" : "bi-list"}`} />
              </button>
            </div>
          </div>

          {/* ── Mobile menu ── */}
          {mobileOpen && (
            <div className="d-lg-none mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="d-flex flex-column gap-1 mb-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-decoration-none px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${isActive(link.href)
                        ? "text-light fw-semibold"
                        : "text-muted2"
                      }`}
                    style={{
                      background: isActive(link.href)
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                      fontSize: "0.9rem",
                    }}
                  >
                    <i className={`bi ${link.icon}`} />
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile search */}
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  placeholder="Search company..."
                  style={{ fontSize: "0.875rem" }}
                />
                <button className="btn btn-accent rounded-3 px-3" type="submit">
                  <i className="bi bi-search" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}