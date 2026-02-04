"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const path = usePathname();

  const Item = ({
    href,
    label,
    icon,
  }: {
    href: string;
    label: string;
    icon: string;
  }) => (
    <Link
      href={href}
      className={`d-block px-3 py-2 rounded-3 text-decoration-none mb-1
      ${
        path === href
          ? "bg-primary text-white"
          : "text-light"
      }`}
    >
      <i className={`bi ${icon} me-2`} />
      {label}
    </Link>
  );

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

      <Item href="/admin" label="Dashboard" icon="bi-speedometer2" />
      <Item href="/admin/users" label="Users" icon="bi-people" />
      <Item href="/admin/reports" label="Reports" icon="bi-flag" />
    </div>
  );
}
