"use client";

import React, { useState, useEffect } from "react";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiArrowRightOnRectangle,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineDocumentDuplicate,
  HiOutlineCommandLine,
  HiOutlinePuzzlePiece,
  HiOutlineSpeakerWave,
  HiOutlineVideoCamera,
  HiOutlineChatBubbleLeftRight,
  HiSun,
  HiMoon,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MENU_CONFIG } from "@/constants/layout";
import { api } from "@/utils/api";

// Map string icons to components
const IconMap = {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineDocumentDuplicate,
  HiOutlineCommandLine,
  HiOutlinePuzzlePiece,
  HiOutlineSpeakerWave,
  HiOutlineVideoCamera,
  HiOutlineChatBubbleLeftRight,
};

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = user?.role || "CANDIDATE";
  const roleMenu = MENU_CONFIG[role] || [];

  // Theme Sync and Toggle
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  // Poll for message count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        if (role === "CANDIDATE") {
          const response = await api.get("/chat_rooms/candidate/rooms/");
          const count = (response.rooms || []).reduce((acc, r) => acc + (r.unread_count || 0), 0);
          setUnreadCount(count);
        } else if (role === "RECRUITER") {
          const jobsResponse = await api.get("/chat_rooms/recruiter/jobs/");
          const jobs = jobsResponse.jobs || [];
          let totalCount = 0;
          for (const job of jobs) {
            const appsResponse = await api.get("/chat_rooms/recruiter/applications/", {
              params: { job_id: job.job_id },
            });
            totalCount += (appsResponse.applications || []).reduce((acc, a) => acc + (a.unread_count || 0), 0);
          }
          setUnreadCount(totalCount);
        }
      } catch (err) {
        console.error("Failed to fetch unread chat count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [user, role]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const getInitials = () => {
    if (!user) return "U";
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return "Guest";
    if (user.profile?.first_name || user.profile?.last_name) {
      return `${user.profile.first_name || ""} ${user.profile.last_name || ""}`.trim();
    }
    return user.email.split("@")[0];
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? "80px" : "240px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-emerald-500/10 flex flex-col z-40 shadow-xl overflow-hidden"
    >
      {/* Top Header: Logo and Title */}
      <div className="p-4 flex flex-col gap-4 border-b border-emerald-500/10">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} w-full`}>
          <div className="flex items-center gap-3">
            <img
              src="/deepscreen.webp"
              alt="DeepScreen Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            {!isCollapsed && (
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tracking-wide">
                DeepScreen
              </span>
            )}
          </div>
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Row: Theme Toggle, Chat Button, Collapse Button */}
        <div className={`flex items-center ${isCollapsed ? "flex-col gap-3" : "justify-between"} w-full`}>
          <div className={`flex items-center ${isCollapsed ? "flex-col gap-3" : "gap-3"}`}>
            {/* Custom Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20 shadow-sm shrink-0"
                title="Toggle Theme"
              >
                {darkMode ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
              </button>
            )}

            {/* Custom Chat Button */}
            <Link
              href={role === "RECRUITER" ? "/chats/recruiter" : "/chats/candidate"}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/20 shadow-sm shrink-0"
              title="Messages"
            >
              <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-card shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              title="Collapse"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Bar - Clicking navigates to Profile */}
      <Link
        href="/users/profile"
        className={`flex items-center ${isCollapsed ? "justify-center px-1" : "gap-3 px-3"} py-2.5 mx-2 my-3 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group cursor-pointer`}
        title={isCollapsed ? "Profile" : undefined}
      >
        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold shrink-0 overflow-hidden shadow-sm">
          {user?.google_picture ? (
            <img
              src={user.google_picture}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials()
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-xs font-semibold truncate text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {getDisplayName()}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {user?.email || "No email"}
            </span>
          </div>
        )}
      </Link>

      {/* Sidebar Navigation Menu */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto scrollbar-none">
        {roleMenu.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 mt-2">
                {section.title}
              </h3>
            )}
            {section.items.map((item) => {
              const Icon = IconMap[item.icon];
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`relative flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {Icon && (
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white dark:text-emerald-400" : "group-hover:text-emerald-500"}`}
                    />
                  )}
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[13px] font-medium whitespace-nowrap tracking-wide"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-emerald-500/10 space-y-1">
        <Link
          href="/settings"
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 group`}
        >
          <HiOutlineCog6Tooth className="w-4 h-4 shrink-0 group-hover:text-emerald-500 transition-colors" />
          {!isCollapsed && <span className="text-xs font-semibold">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 p-2 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 ${isCollapsed ? "justify-center" : "px-3"}`}
          title="Logout"
        >
          <HiArrowRightOnRectangle className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-semibold whitespace-nowrap">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
