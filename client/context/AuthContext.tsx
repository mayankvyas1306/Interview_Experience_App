"use client";


import { createContext, useContext, useEffect, useState } from "react";

type AuthUser = {
    token :string | null;
    fullName: string | null;
};

type AuthContextType = {
    user: AuthUser;
    login: (token: string,fullName: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }:{ children: React.ReactNode}){
    const [user,setUser] = useState<AuthUser>({
        token:null,
        fullName:null,
    });

    // Run once on app load
    useEffect(()=>{
        const token = localStorage.getItem("token");
        const fullName = localStorage.getItem("fullName");

        if(token){
            setUser({token, fullName});
        }
    },[]);

    const login = (token:string, fullName:string)=>{
        localStorage.setItem("token",token);
        localStorage.setItem("fullName",fullName);

        setUser({token, fullName});

    };

    const logout = () =>{
        localStorage.clear();
        setUser({token: null,fullName:null});
    };

    return (
        <AuthContext.Provider value={{ user, login, logout}}>
            {children}
        </AuthContext.Provider>
    );

}

// custom hook
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};