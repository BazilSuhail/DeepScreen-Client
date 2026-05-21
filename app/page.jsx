"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AuthenticatingScreen from "@/components/auth/AuthenticatingScreen";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role === "RECRUITER" || user.role === "STAFF") {
      router.replace("/recruiter");
    } else {
      router.replace("/candidate");
    }
  }, [user, loading, router]);

  return <AuthenticatingScreen />;
}
