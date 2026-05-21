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
  HiOutlineMagnifyingGlass,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineDocumentText,
  HiOutlineDocumentDuplicate,
  HiOutlineCommandLine,
  HiOutlinePuzzlePiece,
  HiOutlineSpeakerWave,
  HiOutlineVideoCamera,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSquares2X2,
  HiOutlinePlus,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MENU_CONFIG } from "@/constants/layout";
import { api } from "@/utils/api";
import ThemeToggle from "./ThemeToggle";
import LogoutModal from "./LogoutModal";

const IconMap = {
  HiOutlineHome, HiOutlineUser, HiOutlineChartBar, HiOutlineCog6Tooth,
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineMagnifyingGlass,
  HiOutlineDocumentText, HiOutlineDocumentDuplicate, HiOutlineCommandLine,
  HiOutlinePuzzlePiece, HiOutlineSpeakerWave, HiOutlineVideoCamera,
  HiOutlineChatBubbleLeftRight, HiOutlineSquares2X2,
};

// Placeholder shown while auth loads. Mirrors the real sidebar's header, profile bar, nav and footer so nothing shifts on resolve.
function SidebarSkeleton({ isCollapsed }) {
  const bar = "rounded bg-secondary/60";
  const groups = [2, 2, 1];

  return (
    <div role="status" className="flex flex-col flex-1 min-h-0 animate-pulse">
      <span className="sr-only">Loading navigation</span>

      <div className="p-4 flex flex-col gap-4 border-b border-border">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 rounded-lg bg-secondary/60 shrink-0" />
          {!isCollapsed && <div className={`h-5 w-28 ${bar}`} />}
        </div>
        <div className={`flex items-center ${isCollapsed ? "flex-col gap-3" : "gap-3"}`}>
          {!isCollapsed && <div className="h-8 w-20 rounded-lg bg-secondary/60" />}
          <div className="w-9 h-9 rounded-xl bg-secondary/60 shrink-0" />
        </div>
      </div>

      <div className={`flex items-center ${isCollapsed ? "justify-center px-1" : "gap-3 px-3"} py-2.5 mx-2 my-3 rounded-xl border border-border`}>
        <div className="w-9 h-9 rounded-full bg-secondary/60 shrink-0" />
        {!isCollapsed && (
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <div className={`h-3 w-24 ${bar}`} />
            <div className={`h-2.5 w-32 ${bar}`} />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-4 overflow-hidden">
        {groups.map((itemCount, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {!isCollapsed && <div className={`h-2.5 w-16 mx-3 mt-2 mb-2 ${bar} opacity-60`} />}
            {Array.from({ length: itemCount }).map((_, itemIndex) => (
              <div
                key={itemIndex}
                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-3 rounded-xl`}
              >
                <div className="w-4 h-4 rounded bg-secondary/60 shrink-0" />
                {!isCollapsed && <div className={`h-3 flex-1 ${bar}`} />}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} p-2 rounded-xl`}>
          <div className="w-4 h-4 rounded bg-secondary/60 shrink-0" />
          {!isCollapsed && <div className={`h-3 w-16 ${bar}`} />}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetchedOrg, setOrg] = useState(null);

  const role = user?.role || "CANDIDATE";
  const roleMenu = MENU_CONFIG[role] || [];
  const hasOrg = !!user && ['STAFF', 'RECRUITER'].includes(role);
  const org = hasOrg ? fetchedOrg : null;
  // Staff manage an organization, not a personal profile, so the profile bar is not a link for them.
  const ProfileTag = role === "STAFF" ? "div" : Link;
  const profileHref = role === "RECRUITER" ? "/recruiter/profile" : "/candidate/profile";
  const profileProps = role === "STAFF" ? {} : { href: profileHref };
  const orgSlug = org?.slug;

  const isActive = (itemPath) => {
    const p = orgSlug ? itemPath.replace(':slug', orgSlug) : itemPath;
    return pathname === p;
  };

  const resolvePath = (itemPath) => orgSlug ? itemPath.replace(':slug', orgSlug) : itemPath;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch org for STAFF/RECRUITER
  useEffect(() => {
    if (!hasOrg) return;
    api.get('/organizations/').then((data) => {
      if (Array.isArray(data) && data.length > 0) setOrg(data[0]);
      else setOrg(null);
    }).catch(() => setOrg(null));
  }, [user, hasOrg]);

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

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
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
    <>
    <motion.aside
      animate={{ width: isCollapsed ? "80px" : "240px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      className="fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col z-40 shadow-xl overflow-hidden"
    >
      {loading ? <SidebarSkeleton isCollapsed={isCollapsed} /> : (
      <>

      {/* Top Header */}
      <div className="p-4 flex flex-col gap-4 border-b border-border">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} w-full`}>
          <div className="flex items-center gap-3">
            <img src="/deepscreen.webp" alt="DeepScreen Logo" className="w-8 h-8 object-contain shrink-0" />
            {!isCollapsed && (
              <span className="font-bold text-lg text-foreground tracking-wide">DeepScreen</span>
            )}
          </div>
        </div>

        <div className={`flex items-center ${isCollapsed ? "flex-col gap-3" : "gap-3"}`}>
          {mounted && !isCollapsed && <ThemeToggle />}
          {role !== 'STAFF' && (
            <Link
              href={role === "RECRUITER" ? "/chats/recruiter" : "/chats/candidate"}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground transition-all border border-border shrink-0"
              title="Messages"
            >
              <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-card shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>



      {/* Profile Bar */}
      <ProfileTag
        {...profileProps}
        className={`flex items-center ${isCollapsed ? "justify-center px-1" : "gap-3 px-3"} py-2.5 mx-2 my-3 rounded-xl border border-border hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group`}
        title={isCollapsed ? "Profile" : undefined}
      >
        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold shrink-0 overflow-hidden shadow-sm">
          {user?.google_picture ? (
            <img src={user.google_picture} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            getInitials()
          )}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-xs font-semibold truncate text-foreground group-hover:text-emerald-500 transition-colors">
              {getDisplayName()}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {user?.email || "No email"}
            </span>
          </div>
        )}
      </ProfileTag>

      {/* Org / Create button */}
      {role === 'STAFF' && (org ? (
        <Link
          href={`/organizations/${org.slug}`}
          className={`relative mx-2 rounded-2xl overflow-hidden transition-all duration-300 group ${
            isCollapsed ? "block p-2" : "block"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-emerald-600/5 to-transparent group-hover:from-emerald-500/25 group-hover:via-emerald-600/10 transition-all duration-500" />
          <div className="absolute inset-0 border border-emerald-500/20 group-hover:border-emerald-500/40 rounded-2xl transition-all duration-300" />
          {!isCollapsed ? (
            <div className="relative flex items-center gap-3 px-3 py-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-600/30 shrink-0">
                {org.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate group-hover:text-emerald-400 transition-colors">
                  {org.name}
                </div>
                <div className="text-[10px] text-emerald-500/70 font-medium">Your Organization</div>
              </div>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-all">
                <HiOutlineChevronRight className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-600/30">
                {org.name[0]}
              </div>
            </div>
          )}
        </Link>
      ) : (
        <Link
          href="/organizations/create"
          className={`relative mx-2 rounded-2xl overflow-hidden transition-all duration-300 group ${
            isCollapsed ? "block p-2" : "block"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent group-hover:from-emerald-500/20 transition-all duration-500" />
          <div className="absolute inset-0 border border-dashed border-emerald-500/20 group-hover:border-emerald-500/40 rounded-2xl transition-all duration-300" />
          {!isCollapsed ? (
            <div className="relative flex items-center gap-3 px-3 py-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                <HiOutlineBuildingOffice2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-muted-foreground group-hover:text-emerald-400 transition-colors">
                Create Organization
              </span>
              <HiOutlinePlus className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <HiOutlineBuildingOffice2 className="w-4 h-4" />
              </div>
            </div>
          )}
        </Link>
      ))}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto scrollbar-none">
        {role === 'STAFF' && !org ? (
          !isCollapsed && (
            <p className="px-3 text-xs text-muted-foreground text-center py-6">
              Create an organization above to access staff pages.
            </p>
          )
        ) : (
          roleMenu.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 mt-2">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => {
                const Icon = IconMap[item.icon];
                const linkPath = resolvePath(item.path);
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    href={linkPath}
                    title={isCollapsed ? item.name : undefined}
                    className={`relative flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} py-3 rounded-xl transition-all duration-300 group ${
                      active
                        ? "bg-emerald-500 dark:bg-emerald-900/80 text-white shadow-md shadow-emerald-500/20"
                        : item.variant === "accent"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500  rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {Icon && <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "group-hover:text-emerald-500 transition-colors"}`} />}
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
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
      
        <button
          onClick={() => setLogoutOpen(true)}
          className={`flex w-full items-center gap-3 p-2 rounded-xl transition-all duration-200 text-red-700 dark:text-red-400 hover:bg-destructive/10 ${isCollapsed ? "justify-center" : "px-3"}`}
          title="Logout"
        >
          <HiArrowRightOnRectangle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="text-sm font-semibold whitespace-nowrap">Logout</span>}
        </button>
      </div>
      </>
      )}
      <LogoutModal open={logoutOpen} busy={loggingOut} onCancel={() => setLogoutOpen(false)} onConfirm={handleLogout} />
    </motion.aside>

      {/* Floating collapse button */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        animate={{ left: isCollapsed ? "65px" : "222px" }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        className="fixed top-3 z-50 w-9 h-9 rounded-full hover:bg-card bg-secondary hover:text-muted-foreground text-foreground border-2 border-border transition-colors flex items-center justify-center shadow-md"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <HiOutlineChevronRight className="w-3" /> : <HiOutlineChevronLeft className="w-3" />}
      </motion.button>
    </>
  );
}
