"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminItemProps = {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
};

function AdminNavItem({ href, label, icon, isActive }: AdminItemProps) {
  return (
    <Link
      href={href}
      className={`d-block px-3 py-2 rounded-3 text-decoration-none mb-1
      ${
        isActive
          ? "bg-primary text-white"
          : "text-light"
      }`}
    >
      <i className={`bi ${icon} me-2`} />
      {label}
    </Link>
  );
}

export default function AdminSidebar() {
  const path = usePathname();

  return (
    <div
      className="p-3"
      style={{
        width: 230,
        background: "#0b1020",
        borderRight: "1px solid #1f2a40",
      }}
    >
      <h5 className="fw-bold mb-4">Admin Panel</h5>

      <AdminNavItem
        href="/admin"
        label="Dashboard"
        icon="bi-speedometer2"
        isActive={path === "/admin"}
      />
      <AdminNavItem
        href="/admin/users"
        label="Users"
        icon="bi-people"
        isActive={path === "/admin/users"}
      />
      <AdminNavItem
        href="/admin/reports"
        label="Reports"
        icon="bi-flag"
        isActive={path === "/admin/reports"}
      />
    </div>
  );
}
