"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give time for user to load from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only check after initial loading
    if (isChecking) return;

    // If no user, redirect to login
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // If user is not admin, redirect to home
    if (user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [user, isChecking, router]);

  // Show loading while checking
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

  // User is not admin (will redirect but show nothing meanwhile)
  if (user.role !== "admin") {
    return null;
  }

  // All checks passed, show admin content
  return <>{children}</>;
}