"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "motion/react";
import { NAVBAR_ONLY_PATHS, SIDEBAR_PATHS } from "@/constants/layout";

export default function LayoutWrapper({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  
  const showNavbar = NAVBAR_ONLY_PATHS.some((path) => 
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  );
  
  const showSidebar = SIDEBAR_PATHS.some((path) => pathname.startsWith(path));

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
        <main className={`flex-1 w-full max-w-full overflow-x-hidden ${showNavbar ? "pt-24" : ""}`}>
          <div className="mx-auto w-full max-w-7xl px-4">
            {children}
          </div>
        </main>
      </motion.div>
    </div>
  );
}
