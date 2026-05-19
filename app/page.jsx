"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-slate-950 to-black">
      <div className="flex flex-col items-center gap-10">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-28 h-28 rounded-[32px] bg-black/40 backdrop-blur-xl border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10 overflow-hidden">
            <Image src="/deepscreen.webp" alt="DeepScreen" width={96} height={96} className="object-contain p-3" priority />
          </div>
          <div className="absolute -inset-4 rounded-[40px] border-2 border-emerald-500/20 animate-spin [animation-duration:3s]" />
          <div className="absolute -inset-8 rounded-[48px] border border-emerald-500/10 animate-spin [animation-duration:5s] [animation-direction:reverse]" />
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Deep<span className="text-emerald-400">Screen</span>
          </h1>
          <p className="text-emerald-400/60 text-sm font-semibold mt-2 tracking-widest uppercase">
            Authenticating
          </p>
        </div>

        {/* Spinner */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
