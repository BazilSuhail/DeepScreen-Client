"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FaGoogle, FaEnvelope, FaLock, FaArrowRight, FaUserTie, FaUserGraduate, FaCheckCircle, FaHome, FaFingerprint } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from "axios";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "a@gmail.com",
        password: "112233",
    });
    const [isNewUser, setIsNewUser] = useState(false);
    const [selectedRole, setSelectedRole] = useState("candidate");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRedirect = (role) => {
        if (role === "recruiter") {
            router.push("/recruiter/dashboard");
        } else {
            router.push("/candidate/profile");
        }
    };

    useEffect(() => {
        const access = searchParams.get("access_token");
        const refresh = searchParams.get("refresh_token");
        const userStr = searchParams.get("user");
        const isNew = searchParams.get("is_new");

        if (access && refresh && userStr) {
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            localStorage.setItem("user", userStr);
            if (userStr) {
                try { 
                    if (isNew === "true") {
                        setIsNewUser(true);
                    } else {
                        handleRedirect(userStr.role);
                    }
                } catch (e) {
                    console.error("Failed to parse user data", e);
                }
            }
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login/`, formData);
            const data = response.data;

            localStorage.setItem("access_token", data.tokens.access);
            localStorage.setItem("refresh_token", data.tokens.refresh);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            handleRedirect(data.user.role);
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/google/login/`);
            if (response.data.auth_url) {
                window.location.href = response.data.auth_url;
            }
        } catch (err) {
            setError("Failed to initialize Neural ID handshake");
        }
    };

    const handleSetRole = async () => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("access_token");

        try {
            const resp = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/set-role/`,
                { role: selectedRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update stored user with new role
            const user = JSON.parse(localStorage.getItem("user"));
            user.role = selectedRole;
            localStorage.setItem("user", JSON.stringify(user));

            handleRedirect(selectedRole);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to finalize entity role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-poppins selection:bg-emerald-100 selection:text-emerald-700">
            {/* Navigation back home */}
            <Link href="/" className="fixed top-8 left-8 p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all rounded-2xl shadow-sm z-50 group flex items-center  font-bold text-xs uppercase tracking-widest">
                <FaHome size={16} />
                <span className="max-w-0 overflow-hidden group-hover:max-w-sm group-hover:ml-[12px] transition-all duration-300">Terminal</span>
            </Link>

            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/40 blur-[140px] rounded-full z-0 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-50 blur-[120px] rounded-full z-0"></div>

            <div className="relative z-10 w-full max-w-[550px] p-4">
                {isNewUser ? (
                    <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.03)] space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-transform hover:rotate-3 shadow-inner">
                                <FaFingerprint size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Entity Role</h1>
                            <p className="text-slate-400 text-[13px] font-medium leading-relaxed">Customize your neural workspace projection.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pb-2">
                            <button
                                onClick={() => setSelectedRole("candidate")}
                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedRole === "candidate"
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm"
                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                                    }`}
                            >
                                <FaUserGraduate size={20} />
                                <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Candidate</span>
                                {selectedRole === "candidate" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                            </button>
                            <button
                                onClick={() => setSelectedRole("recruiter")}
                                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedRole === "recruiter"
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm"
                                    : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                                    }`}
                            >
                                <FaUserTie size={20} />
                                <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Recruiter</span>
                                {selectedRole === "recruiter" && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-[11px] px-4 py-3 rounded-xl text-center font-bold border border-red-100">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSetRole}
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {loading ? (
                                <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <span>Sync Workspace</span>
                                    <FaCheckCircle size={14} />
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.03)] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-2 transition-transform hover:rotate-3">
                                <span className="text-white font-black text-md italic tracking-tighter">DS</span>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Portal</h1>
                            <p className="text-slate-400 text-[13px] font-medium leading-relaxed px-4">Authenticate your credentials to access your instance.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <FaEnvelope size={14} />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Email Address"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-medium text-[14px]"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                        <FaLock size={14} />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        placeholder="Secure Passphrase"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-medium text-[14px]"
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
                                        <span>Sign In</span>
                                        <FaArrowRight size={12} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-400"></div>
                            <span className="flex-shrink mx-4 text-slate-500 text-[11px] font-bold tracking-widest uppercase">Federated Auth</span>
                            <div className="flex-grow border-t border-slate-400"></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 shadow-sm shadow-slate-100 text-slate-600 font-bold h-14 rounded-2xl transition-all flex items-center justify-center gap-4 group"
                        >
                            <FaGoogle className="text-emerald-500 text-[22px] transition-transform group-hover:scale-110" />
                            <span className="text-[15px]">Access with Google ID</span>
                        </button>

                        <p className="text-center text-slate-400 text-sm font-medium pt-2">
                            Not registered?{" "}
                            <Link
                                href="/auth/register"
                                className="text-emerald-600 hover:underline font-bold"
                            >
                                Create profile
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
