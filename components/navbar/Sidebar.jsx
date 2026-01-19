"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HiOutlineHome,
    HiOutlineUser,
    HiOutlineBriefcase,
    HiOutlineClipboardList,
    HiOutlineMail,
    HiOutlineCog,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineLogout,
    HiOutlinePlusCircle,
    HiOutlineUsers,
    HiOutlineChartBar,
    HiOutlineViewGrid,
    HiOutlineOfficeBuilding,
    HiBookOpen
} from 'react-icons/hi';
import axios from 'axios';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // const isResumeePage = pathname === '/candidate/resume';
    const isResumeePage = /^\/candidate\/resume-builder\/.+$/.test(pathname);
    const shouldBeCollapsed = isResumeePage;

    useEffect(() => {
        // Force collapse on resume page
        if (isResumeePage) {
            setIsCollapsed(true);
        }
    }, [isResumeePage, setIsCollapsed]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setLoading(false);
        } else {
            // Only keep loading if we really have no user data yet
            const timer = setTimeout(() => setLoading(false), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const handleLogout = async () => {
        try {
            const accessToken = localStorage.getItem("access_token");
            const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

            if (accessToken) {
                await axios.post(`${SERVER_URL}/auth/logout/`, {}, {
                    headers: { "Authorization": `Bearer ${accessToken}` }
                });
            }
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            localStorage.clear();
            window.location.href = "/auth/login";
        }
    };

    const NAVIGATION_CONFIG = {
        candidate: [
            { name: 'Dashboard', href: '/', icon: HiOutlineHome },
            { name: 'Applications', href: '/applications', icon: HiOutlineClipboardList },
            { name: 'My Resumes', href: '/candidate/resumes', icon: HiOutlineBriefcase },
            { name: 'Resume Builder', href: '/candidate/resume-builder', icon: HiBookOpen },
            { name: 'Profile', href: '/candidate/profile', icon: HiOutlineUser },
            { name: 'Messages', href: '/messages', icon: HiOutlineMail },
            { name: 'Settings', href: '/settings', icon: HiOutlineCog },
        ],
        recruiter: [
            { name: 'Overview', href: '/recruiter/dashboard', icon: HiOutlineViewGrid },
            { name: 'Profile', href: '/recruiter/profile', icon: HiOutlineUser },
            { name: 'Organization', href: '/recruiter/org', icon: HiOutlineOfficeBuilding },
            { name: 'Post Job', href: '/recruiter/jobs/post-job', icon: HiOutlinePlusCircle },
            { name: 'Manage Jobs', href: '/recruiter/jobs', icon: HiOutlineBriefcase },
            { name: 'Applicants', href: '/recruiter/applications', icon: HiOutlineUsers },
            { name: 'Analytics', href: '/recruiter/analytics', icon: HiOutlineChartBar },
            { name: 'Settings', href: '/settings', icon: HiOutlineCog },
        ]
    };

    const currentRole = user?.role || 'candidate';
    const navItems = NAVIGATION_CONFIG[currentRole] || NAVIGATION_CONFIG.candidate;

    if (isResumeePage) {
        return <></>;
    }
    return (
        <>
            <aside
                className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-100 transition-all duration-300 ease-in-out z-50 flex flex-col font-poppins overflow-x-hidden ${isCollapsed || shouldBeCollapsed ? 'w-21' : 'w-60'
                    }`}
            >
                {/* Logo Section */}
                <Link href="/">
                    <div className="flex items-center h-20 px-6 border-b border-slate-50">
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'mx-auto' : ''}`}>
                            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform hover:rotate-3">
                                <span className="text-white text-md font-black italic">DS</span>
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                                        DeepScreen
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">
                                        {currentRole}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>                </Link>

                {/* User Info Bar - Cleaned up */}
                {!isCollapsed && (
                    <div className="px-4 py-6">
                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-emerald-600 font-bold shrink-0">
                                {user?.username?.substring(0, 1).toUpperCase() || user?.email?.substring(0, 1).toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[13px] font-bold text-slate-900 truncate">
                                    {loading ? <div className="h-2 w-16 bg-slate-200 animate-pulse rounded"></div> : (user?.username || 'Deep User')}
                                </div>
                                <div className="text-[10px] font-medium text-slate-400 truncate">
                                    {loading ? <div className="h-1.5 w-24 bg-slate-200 animate-pulse rounded mt-1"></div> : (user?.email || 'user@example.com')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Links - Reduced Padding */}
                <nav className="flex-1 overflow-x-hidden px-3 space-y-1 overflow-y-auto custom-scrollbar pt-2">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center px-3 py-3 rounded-xl gap-3">
                                <div className="w-5 h-5 bg-slate-50 animate-pulse rounded-md"></div>
                                {!isCollapsed && <div className="h-3 bg-slate-50 animate-pulse rounded flex-1"></div>}
                            </div>
                        ))
                    ) : (
                        navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-500/5'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className={`text-xl min-w-6 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500 transition-colors'}`} />
                                    {!isCollapsed && (
                                        <span className={`ml-3 text-[14px] whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                                            {item.name}
                                        </span>
                                    )}

                                    {isCollapsed && (
                                        <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-900 text-white text-[9px] uppercase font-bold tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60] shadow-xl">
                                            {item.name}
                                        </div>
                                    )}
                                </Link>
                            );
                        })
                    )}
                </nav>

                {/* Footer Actions */}
                <div className="p-3 mt-auto border-t border-slate-50 space-y-1">
                    <button
                        onClick={toggleSidebar}
                        disabled={shouldBeCollapsed}
                        className={`flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${shouldBeCollapsed
                            ? 'text-slate-300 cursor-not-allowed bg-slate-50/50'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        {(isCollapsed || shouldBeCollapsed) ? (
                            <HiOutlineChevronRight className="text-xl mx-auto" />
                        ) : (
                            <>
                                <HiOutlineChevronLeft className="text-xl" />
                                <span className="ml-3 font-bold text-[13px]">Collapse</span>
                            </>
                        )}
                    </button>

                    {!isCollapsed && !shouldBeCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all duration-200 group relative"
                        >
                            <HiOutlineLogout className="text-xl group-hover:-translate-x-1 transition-transform" />
                            <span className="ml-3 font-bold text-[13px]">Log Out</span>
                        </button>
                    )}

                    {isCollapsed && !shouldBeCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all duration-200 group relative"
                        >
                            <HiOutlineLogout className="text-xl mx-auto group-hover:-translate-x-1 transition-transform" />
                            <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-900 text-white text-[9px] uppercase font-bold tracking-wider rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60] shadow-xl">
                                Log Out
                            </div>
                        </button>
                    )}
                </div>
            </aside>
            {/*  
        {!isCollapsed && !shouldBeCollapsed && (
            <button
                onClick={() => setIsCollapsed(true)}
                className="fixed left-16 bottom-8 z-50 p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl group"
                title="Collapse sidebar"
            >
                <HiOutlineChevronLeft className="text-lg group-hover:-translate-x-0.5 transition-transform" />
            </button>
        )} */}
        </>
    );
};

export default Sidebar;