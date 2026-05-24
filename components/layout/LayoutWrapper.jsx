"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import useNav from "./useNav";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import {
  NAVBAR_ONLY_PATHS,
  SIDEBAR_PATHS,
  NO_LAYOUT_PATHS,
} from "@/constants/layout";

export default function LayoutWrapper({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isHome = pathname === "/";
  const showNoLayout =
    isHome ||
    NO_LAYOUT_PATHS.some((path) => {
      const rest = pathname.startsWith(path) ? pathname.slice(path.length) : "";
      return rest.startsWith("/") && rest.length > 1;
    });
  const showNavbar =
    !showNoLayout &&
    NAVBAR_ONLY_PATHS.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path),
    );
  const showSidebar =
    !showNoLayout && !showNavbar && SIDEBAR_PATHS.some((path) => pathname.startsWith(path));
  // Signed-in users keep the bottom bar on the public job board so they can get back into the app.
  const showMobileNav = !!user && (showSidebar || (showNavbar && pathname.startsWith("/jobs")));

  const nav = useNav(showSidebar || showMobileNav);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        <AnimatePresence mode="wait">
          {showSidebar && (
            <motion.div
              key="sidebar"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="z-40 hidden md:block"
            >
              <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                nav={nav}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={false}
          animate={{
            "--sidebar-w": showSidebar ? (isCollapsed ? "80px" : "240px") : "0px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
          className="flex min-w-0 flex-1 flex-col md:pl-[var(--sidebar-w)]"
        >
          {showNavbar && <Navbar />}
          <main
            className={`w-full flex-1 overflow-x-hidden ${showSidebar ? "pt-4" : ""} ${
              showMobileNav ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : ""
            }`}
          >
            {children}
          </main>
        </motion.div>

        {showMobileNav && <MobileNav nav={nav} />}
      </div>
    </MotionConfig>
  );
}
