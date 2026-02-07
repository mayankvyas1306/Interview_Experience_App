"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  token: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // 🔁 Restore user on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Save full user object
  const login = (user: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", user.token);
    setUser(user);
  };

  const logout = () => {
    //clear all auth data from localStorage
    localStorage.clear();

    //clear user state
    setUser(null);

    //Redirect to login page
    //prevents showing blank page, gives clear next action
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
