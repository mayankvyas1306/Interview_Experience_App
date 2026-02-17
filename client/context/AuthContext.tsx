"use client";

import { api } from "@/lib/api";
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
      try{
        setUser(JSON.parse(storedUser));
      }catch(error){
        console.error("Failed to parse stored user:",error);
        localStorage.clear();
      }
    }
  }, []);

  // ✅ Save full user object
  const login = (user: AuthUser) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", user.token);
    localStorage.setItem("userId",user.id);
    setUser(user);
  };

  const logout = async() => {
    try{
      await api.post("/auth/logout");
    }catch{}
    setUser(null);

    //clear all auth data from localStorage
    localStorage.clear();


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
