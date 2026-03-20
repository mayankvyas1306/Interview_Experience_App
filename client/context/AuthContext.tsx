"use client";

import { api } from "@/lib/api";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Restore user from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser) as AuthUser);
    } catch {
      // Corrupted storage — clear everything and start fresh
      localStorage.clear();
    }
  }, []);

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userId", userData.id);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Silent — we always log out on the client even if the server call fails
    }

    setUser(null);
    localStorage.clear();

    // Hard redirect to clear all component state
    window.location.href = "/auth/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}