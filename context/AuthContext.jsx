"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

const TOKEN_KEY = "access_token";

// Store the JWT only when the server actually returned one; never persist "undefined".
const saveAccessToken = (token) => {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Sign-in did not return an access token. Please try again.");
  }
  localStorage.setItem(TOKEN_KEY, token);
};

// The single source of signed-in state: the token lives in localStorage (read by utils/*_api.js), the user here.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Bumped on every sign-in/sign-out. A load that started under an older session drops its result,
  // so a slow startup check on an old token can't overwrite (or delete the token of) a fresh login.
  const sessionGen = useRef(0);

  // Fetches the profile for the stored token and sets the user with its `profile` sub-object.
  const loadUser = useCallback(async (gen = sessionGen.current) => {
    const profileData = await api.get("/accounts/profiles/me/");
    if (gen !== sessionGen.current) return;
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
  }, []);

  // Loads the signed-in user from the stored token. Also exposed as refreshUser().
  const checkAuth = useCallback(async () => {
    const gen = sessionGen.current;
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setLoading(false);
          router.push("/auth/login");
          return;
        }
      } catch { }

      try {
        await loadUser(gen);
      } catch {
        if (gen !== sessionGen.current) return;
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        router.push("/auth/login");
      }
    }
    setLoading(false);
  }, [router, loadUser]);

  useEffect(() => {
    (async () => { await checkAuth(); })();
  }, [checkAuth]);

  // Stores the token and sets the user before resolving, so the caller can navigate with no signed-out flash.
  const startSession = useCallback(async (data) => {
    saveAccessToken(data.access_token);
    sessionGen.current += 1;
    setUser(data.user);
    setLoading(false);
    // Upgrade to the full profile shape; keep data.user if the profile isn't readable yet.
    try { await loadUser(); } catch { }
    return data;
  }, [loadUser]);

  const requestCode = (email) => api.post("/accounts/auth/request_code/", { email });

  const requestStaffCode = (email) => api.post("/accounts/auth/staff/request_code/", { email });

  const verifyEmail = (code, email) => api.post("/accounts/auth/verify/", { code, email });

  const register = async (userData) => startSession(await api.post("/accounts/auth/register/", userData));

  const registerStaff = async (userData) => startSession(await api.post("/accounts/auth/staff/register/", userData));

  const completeRecruiterInvite = async (payload) =>
    startSession(await api.post("/accounts/auth/recruiter/complete/", payload));

  const login = async (credentials) => startSession(await api.post("/accounts/auth/login/", credentials));

  // Exchanges the Google popup's ID token for our own JWT. Stable so GoogleAuthButton doesn't re-render Google's button.
  const loginWithGoogle = useCallback(
    async (credential) => startSession(await api.post("/accounts/google/verify/", { credential })),
    [startSession]
  );

  // Clears the token and user in one call; nothing else holds auth state.
  const logout = useCallback(() => {
    sessionGen.current += 1;
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setLoading(false);
    router.push("/auth/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        registerStaff,
        completeRecruiterInvite,
        requestCode,
        requestStaffCode,
        verifyEmail,
        logout,
        refreshUser: checkAuth,
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
