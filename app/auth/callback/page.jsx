"use client";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiOutlineSparkles } from "react-icons/hi";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const access = searchParams.get("access_token");
        const refresh = searchParams.get("refresh_token");
        const user = searchParams.get("user");

        if (access && refresh && user) {
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("user", user);

            window.location.href = "/";
        } else {
            console.error("Auth failed: Missing tokens");
            router.push("/auth/login?error=oauth_failed");
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-900 font-sans">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                    <HiOutlineSparkles size={48} className="text-white animate-spin-slow" />
                </div>
            </div>

            <div className="text-center space-y-4 relative z-10">
                <h2 className="text-4xl font-black tracking-tight text-slate-900">Synchronizing Identity</h2>
                <div className="flex items-center justify-center gap-3">
                    <AiOutlineLoading3Quarters className="animate-spin text-emerald-500" size={24} />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Establishing Secure Bridge...</p>
                </div>
            </div>

            {/* Background Grid */}
            <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] -z-10 opacity-30"></div>
        </div>
    );
}