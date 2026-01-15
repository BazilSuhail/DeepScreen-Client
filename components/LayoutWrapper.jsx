"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "motion/react";

export default function LayoutWrapper({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const sidebarPages = ["/dashboard", "/profile", "/analytics", "/settings"];
  const showSidebar = sidebarPages.some((page) => pathname.startsWith(page));

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
        {!showSidebar && <Navbar />}
        <main className={`flex-1 w-full max-w-full overflow-x-hidden ${!showSidebar ? "pt-24" : ""}`}>
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </motion.div>
    </div>
  );
}
