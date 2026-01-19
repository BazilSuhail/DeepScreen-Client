"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { usePathname, useRouter } from 'next/navigation';

const LayoutWrapper = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isAuthPage = pathname?.startsWith('/auth');
    const isPublicPage = /^\/($|jobs(\/.*)?$|companies(\/.*)?$)/.test(pathname);
    const isResumePage = /^\/candidate\/resume-builder\/\d+$/.test(pathname);
    const showSidebar = pathname?.startsWith('/candidate') || pathname?.startsWith('/recruiter');

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        // Redirect to login only if no token and it's NOT an auth page AND NOT a public page
        if (!token && !isAuthPage && !isPublicPage) {
            router.push('/auth/login');
        }
    }, [isAuthPage, isPublicPage, router]);

    if (isAuthPage) {
        return <div className="min-h-screen font-poppins">{children}</div>;
    }

    return (
        <div className=" min-h-screen bg-slate-50 font-poppins selection:bg-emerald-100 selection:text-emerald-700">
            {/* Horizontal Navbar - Shows only on Home Page */}
            <Navbar />

            {/* Sidebar - Shows only on internal dashboard/profile routes */}
            {showSidebar && <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}

            {/* Main Content Area */}
            <main
                className={`flex-1 transition-all duration-500 ease-in-out min-h-screen ${isResumePage ? 'pl-0' : (showSidebar ? (isCollapsed ? 'pl-21' : 'pl-60') : 'pl-0')
                    } ${isPublicPage ? 'pt-0' : ''}`}
            >
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default LayoutWrapper;
