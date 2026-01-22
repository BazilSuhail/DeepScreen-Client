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
  HiOutlineDocumentText
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
  HiOutlineDocumentText
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
          {isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = IconMap[item.icon];
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-muted-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600"
                }`}
            >
              {Icon && <Icon className={`w-6 h-6 shrink-0 ${isActive ? "text-white" : "group-hover:text-emerald-600"}`} />}
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-emerald-500/10 space-y-4">
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
              {user?.google_picture ? (
                <img src={user.google_picture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials()
              )}
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                <span className="text-sm font-semibold truncate w-32">{getDisplayName()}</span>
                <span className="text-xs text-muted-foreground truncate w-32">{user?.role || "User"}</span>
              </motion.div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 ${isCollapsed ? "justify-center" : ""}`}
            title="Logout"
          >
            <HiArrowRightOnRectangle className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
