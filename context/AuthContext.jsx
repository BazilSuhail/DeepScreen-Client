"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("access_token");
            setUser(null);
            setLoading(false);
            router.push("/auth/login");
            return;
          }
        } catch { }

        try {
          const profileData = await api.get("/accounts/profiles/me/");
          setUser({
            ...profileData.user,
            profile: {
              profile_id: profileData.profile_id,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              avatar_url: profileData.avatar_url,
              phone: profileData.phone,
              bio: profileData.bio,
            },
          });
        } catch {
          localStorage.removeItem("access_token");
          setUser(null);
          router.push("/auth/login");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const requestCode = async (email) => {
    return await api.post("/accounts/auth/request_code/", { email });
  };

  const requestStaffCode = async (email) => {
    return await api.post("/accounts/auth/staff/request_code/", { email });
  };

  const register = async (userData) => {
    const data = await api.post("/accounts/auth/register/", userData);
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    router.push("/");
    return data;
  };

  const registerStaff = async (userData) => {
    const data = await api.post("/accounts/auth/staff/register/", userData);
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    router.push("/auth/organization/create");
    return data;
  };

  const login = async (credentials) => {
    const data = await api.post("/accounts/auth/login/", credentials);
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    router.push("/");
    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerStaff,
        requestCode,
        requestStaffCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
