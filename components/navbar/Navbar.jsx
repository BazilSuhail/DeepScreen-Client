"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineUserCircle, HiOutlineLogout } from 'react-icons/hi';

const Navbar = () => {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const isVisible = /^\/($|(jobs|companies)(\/.*)?$|ai-interview$)/.test(pathname);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsLoggedIn(true);
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        setIsLoggedIn(false);
        window.location.href = "/auth/login";
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] px-6">
            <nav className={`max-w-7xl mx-auto transition-all duration-500 rounded-[28px] ${scrolled
                ? 'bg-white/70 backdrop-blur-xl border border-slate-200 py-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)]'
                : 'bg-white/30 backdrop-blur-sm border border-white/20 py-5 shadow-none'
                }`}>
                <div className="px-8 flex items-center justify-between font-poppins">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-transform hover:rotate-3">
                            <span className="text-white font-black italic">DS</span>
                        </div>
                        <span className={`text-xl font-bold tracking-tight text-slate-800`}>
                            DeepScreen
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        <Link href="/" className="text-[15px] font-bold text-emerald-600">Home</Link>
                        <Link href="/jobs" className="text-[15px] font-medium text-slate-500 hover:text-emerald-600 transition-colors">Explore Jobs</Link>
                        <Link href="/companies" className="text-[15px] font-medium text-slate-500 hover:text-emerald-600 transition-colors">Companies</Link>
                    </div>

                    <div className="flex items-center gap-6">
                        {isLoggedIn && (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <HiOutlineLogout size={22} />
                            </button>
                        )}
                        {isLoggedIn ? (
                            <Link
                                href={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/profile'}
                                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-500 transition-all overflow-hidden shadow-sm"
                            >
                                <HiOutlineUserCircle size={26} />
                            </Link>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;