"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
    >
      <div className="glass px-6 py-3 rounded-2xl flex items-center justify-between border border-emerald-500/20 shadow-lg backdrop-blur-md">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          DeepScreen
        </Link>
        
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          {pathSegments.length > 0 && <span className="text-emerald-600">\</span>}
          {pathSegments.map((segment, index) => {
            const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const isLast = index === pathSegments.length - 1;
            return (
              <div key={path} className="flex items-center gap-4">
                <Link 
                  href={path} 
                  className={`capitalize transition-colors ${isLast ? 'text-emerald-600 font-semibold' : 'hover:text-emerald-500'}`}
                >
                  {segment}
                </Link>
                {!isLast && <span className="text-emerald-600">\</span>}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/users/profile" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs border border-emerald-500/20">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {user.email.split('@')[0]}
                </span>
              </Link>
            </div>
          ) : (
            <Link 
              href="/auth/login" 
              className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
            >
              Sign In
            </Link>
          )}
          <div className="h-4 w-[1px] bg-border mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
