"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give localStorage time to hydrate before checking auth
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isChecking) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
    }
  }, [user, isChecking, router]);

  if (isChecking || !user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted2 mt-3">Checking permissions...</p>
      </div>
    );
  }

  if (user.role !== "admin") return null;

  return (
    // Side-by-side layout: sidebar on left, content on right
    <div className="d-flex" style={{ minHeight: "calc(100vh - 80px)" }}>
      <AdminSidebar />
      <main className="flex-grow-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}