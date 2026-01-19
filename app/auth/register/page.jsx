"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FaGoogle, FaEnvelope, FaLock, FaUserPlus, FaUserTie, FaUserGraduate, FaExclamationCircle, FaHome } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from "axios";

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "candidate", // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

    const handleRedirect = (role) => {
        if (role === "recruiter") {
            router.push("/recruiter/dashboard");
        } else {
            router.push("/candidate/profile");
        }
    };

    useEffect(() => {
        const emailParam = searchParams.get("email");
        const messageParam = searchParams.get("message");

        if (emailParam) {
            setFormData(prev => ({ ...prev, email: emailParam }));
        }
        if (messageParam) {
            setInfoMessage(messageParam);
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/register/`, formData);
            const data = response.data;

            localStorage.setItem("access_token", data.tokens.access);
            localStorage.setItem("refresh_token", data.tokens.refresh);
            localStorage.setItem("user", JSON.stringify(data.user));

            handleRedirect(data.user.role);
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google/signup/`, {
                params: { role: formData.role }
            });
            const authUrl = response.data.auth_url;
            if (authUrl) {
                window.location.href = authUrl;
            }
        } catch (err) {
            setError("Failed to initialize Google signup");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-poppins selection:bg-emerald-100 selection:text-emerald-700">
            {/* Home Link */}
            <Link href="/" className="fixed top-8 left-8 p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all rounded-2xl shadow-sm z-50 group flex items-center  font-bold text-xs uppercase tracking-widest">
                <FaHome size={16} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-[15px] transition-all duration-300">Terminal</span>
            </Link>

            {/* Decorative background blurs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/50 blur-[120px] rounded-full z-0"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-50 blur-[120px] rounded-full z-0"></div>

            <div className="relative z-10 w-full max-w-[550px] p-4">
                <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.03)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-2 transition-transform hover:rotate-3">
                            <span className="text-white font-black text-md italic tracking-tighter">DS</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Identity</h1>
                        <p className="text-slate-400 text-[13px] font-medium leading-relaxed px-2">Initialize your profile on our screening network.</p>
                    </div>

                    {infoMessage && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] p-4 rounded-2xl flex items-center gap-3 font-medium animate-pulse">
                            <FaExclamationCircle size={18} className="shrink-0 text-emerald-500" />
                            <p>{infoMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Professional Role Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("candidate")}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${formData.role === "candidate"
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm"
                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                                    }`}
                            >
                                <FaUserGraduate size={25} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Candidate</span>
                                {formData.role === "candidate" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleSelect("recruiter")}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative overflow-hidden ${formData.role === "recruiter"
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm"
                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                                    }`}
                            >
                                <FaUserTie size={25} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Recruiter</span>
                                {formData.role === "recruiter" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                    <FaEnvelope size={18} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter Email"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-medium text-[13px]"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                    <FaLock size={18} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Secure Passphrase"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-medium text-[13px]"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-[11px] px-4 py-3 rounded-xl text-center font-bold border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? (
                                <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>Sign Up</span>
                                    <FaUserPlus size={18} className="mb-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative flex items-center py-1">
                        <div className="flex-grow border-t border-slate-300"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold tracking-widest uppercase">Federated Auth</span>
                        <div className="flex-grow border-t border-slate-300"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 shadow-sm shadow-slate-100 text-slate-600 font-bold h-14 rounded-2xl transition-all flex items-center justify-center gap-4 group"
                    >
                        <FaGoogle className="text-emerald-500 transition-transform group-hover:scale-110" />
                        <span className="text-[13px]">Access with Google ID</span>
                    </button>

                    <p className="text-center text-slate-400 text-sm font-medium pt-1">
                        Already active?{" "}
                        <Link
                            href="/auth/login"
                            className="text-emerald-600 hover:underline font-bold"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
