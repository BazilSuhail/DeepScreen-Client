"use client";

import React from "react";
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
  HiOutlineSpeakerWave
} from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { MENU_CONFIG } from "@/constants/layout";

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
  HiOutlineSpeakerWave
};

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const role = user?.role || 'CANDIDATE';
  const roleMenu = MENU_CONFIG[role] || [];

  const footerItems = [
    { name: "Settings", icon: "HiOutlineCog6Tooth", path: "/settings" },
  ];

  const menuItems = [...roleMenu, ...footerItems];

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
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
    return user.email.split('@')[0];
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? "80px" : "260px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-emerald-500/10 flex flex-col z-40 shadow-xl overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-xl text-emerald-600"
            >
              DS
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
        >
          {isCollapsed ? <HiOutlineChevronRight className="w-5 h-5" /> : <HiOutlineChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-4 pb-4 border-b border-emerald-500/10 space-y-4">
        <div className={`flex ${isCollapsed ? "justify-center" : "justify-between px-2"} items-center`}>
          {!isCollapsed && <span className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-wider">Theme</span>}
          <ThemeToggle />
        </div>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} py-2`}>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold shrink-0 overflow-hidden shadow-sm">
            {user?.google_picture ? (
              <img src={user.google_picture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials()
            )}
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold truncate w-32 text-foreground">{getDisplayName()}</span>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 truncate w-32 capitalize">{user?.role?.toLowerCase() || "User"}</span>
            </motion.div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const Icon = IconMap[item.icon];
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              title={isCollapsed ? item.name : undefined}
              className={`relative flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-2.5 rounded-xl transition-all duration-300 group ${isActive
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/25 hover:text-emerald-700 dark:hover:text-emerald-300"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-500 rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {Icon && <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-emerald-600 dark:text-emerald-400" : "group-hover:text-emerald-500"}`} />}
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium whitespace-nowrap tracking-wide"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-500/10">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 p-2.5 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 ${isCollapsed ? "justify-center" : "px-3"}`}
          title="Logout"
        >
          <HiArrowRightOnRectangle className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
