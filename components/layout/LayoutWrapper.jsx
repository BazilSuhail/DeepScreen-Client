"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "motion/react";
import { NAVBAR_ONLY_PATHS, SIDEBAR_PATHS, NO_LAYOUT_PATHS } from "@/constants/layout";
import { useAuth } from "@/context/AuthContext";

export default function LayoutWrapper({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  
  const showNoLayout = NO_LAYOUT_PATHS.some((path) => {
    const rest = pathname.startsWith(path) ? pathname.slice(path.length) : '';
    return rest.startsWith('/') && rest.length > 1;
  });
  const showNavbar = !showNoLayout && NAVBAR_ONLY_PATHS.some((path) => 
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  );
  const showSidebar = !showNoLayout && SIDEBAR_PATHS.some((path) => pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.div
            key="sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="z-40"
          >
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          paddingLeft: showSidebar
            ? (isCollapsed ? "80px" : "260px")
            : "0px"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        className="flex-1 flex flex-col"
      >
        {showNavbar && <Navbar />}
        <main className={`flex-1 w-full max-w-full overflow-x-hidden `}>
            {children}
        </main>
      </motion.div>
    </div>
  );
}
