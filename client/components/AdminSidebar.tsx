"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "bi-speedometer2" },
  { href: "/admin/users", label: "Users", icon: "bi-people" },
  { href: "/admin/posts", label: "Posts", icon: "bi-file-text" },
  { href: "/admin/reports", label: "Reports", icon: "bi-flag" },
];

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <aside
      className="d-flex flex-column py-4 px-3 flex-shrink-0"
      style={{
        width: 220,
        minHeight: "calc(100vh - 80px)",
        background: "rgba(0,0,0,0.25)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p
        className="text-muted2 small text-uppercase fw-bold mb-3 px-2"
        style={{ letterSpacing: "0.08em", fontSize: "0.7rem" }}
      >
        Admin Panel
      </p>

      <nav className="d-flex flex-column gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? path === "/admin"
              : path.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none transition-all ${isActive
                  ? "btn-accent text-white fw-semibold"
                  : "text-muted2"
                }`}
              style={{
                background: isActive
                  ? "linear-gradient(120deg, rgba(109,94,249,0.85), rgba(0,212,255,0.7))"
                  : "transparent",
                fontSize: "0.9rem",
              }}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: "1rem" }} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}