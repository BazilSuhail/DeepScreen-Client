"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MENU_CONFIG } from "@/constants/layout";
import { api } from "@/utils/api";

// Navigation state shared by the desktop Sidebar and the mobile bottom bar / sheet.
// Called once in LayoutWrapper so the org fetch and unread polling run once, only while a nav is shown.
export default function useNav(enabled) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetchedOrg, setOrg] = useState(null);

  const role = user?.role || "CANDIDATE";
  const roleMenu = MENU_CONFIG[role] || [];
  const hasOrg = enabled && !!user && ["STAFF", "RECRUITER"].includes(role);
  const org = hasOrg ? fetchedOrg : null;
  const orgSlug = org?.slug;

  const resolvePath = (itemPath) => (orgSlug ? itemPath.replace(":slug", orgSlug) : itemPath);

  // Longest matching menu path wins, so nested pages (e.g. /recruiter/jobs/create) highlight their section.
  const allPaths = roleMenu.flatMap((s) => s.items.map((i) => resolvePath(i.path)));
  const matches = (p) => pathname === p || pathname.startsWith(`${p}/`);
  const activePath = allPaths.filter(matches).sort((a, b) => b.length - a.length)[0];
  const isActive = (itemPath) => resolvePath(itemPath) === activePath;

  const messagesHref = role === "RECRUITER" ? "/chats/recruiter" : "/chats/candidate";
  const profileHref = role === "RECRUITER" ? "/recruiter/profile" : "/candidate/profile";

  useEffect(() => {
    if (!hasOrg) return;
    api
      .get("/organizations/")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setOrg(data[0]);
        else setOrg(null);
      })
      .catch(() => setOrg(null));
  }, [user, hasOrg]);

  useEffect(() => {
    if (!enabled || !user) return;
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
  }, [enabled, user, role]);

  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push("/auth/login");
  };

  const initials = !user
    ? "U"
    : user.profile?.first_name && user.profile?.last_name
      ? `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase()
      : user.email[0].toUpperCase();

  const displayName = !user
    ? ""
    : user.profile?.first_name || user.profile?.last_name
      ? `${user.profile.first_name || ""} ${user.profile.last_name || ""}`.trim()
      : user.email.split("@")[0];

  return {
    user,
    loading,
    role,
    roleMenu,
    org,
    resolvePath,
    isActive,
    unreadCount,
    messagesHref,
    profileHref,
    initials,
    displayName,
    loggingOut,
    handleLogout,
  };
}
