"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  // Staff manage an organization, not a personal profile, so their avatar is not a link.
  const ProfileTag = user?.role === "STAFF" ? "div" : Link;
  const profileHref = user?.role === "RECRUITER" ? "/recruiter/profile" : "/candidate/profile";
  const profileProps = user?.role === "STAFF" ? {} : { href: profileHref };
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setVisible(current < 50 || current < lastScroll);
      setLastScroll(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className=" px-6 lg:px-12 xl:px-24 py-3 flex items-center justify-between gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-2.5 shadow-sm flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/deepscreen.webp"
              alt="DeepScreen"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold text-emerald-900 dark:text-white">
              Deep
              <span className="text-emerald-600 dark:text-emerald-300">
                Screen
              </span>
            </span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <nav className="flex items-center gap-5 text-sm font-semibold text-slate-600 dark:text-slate-400">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-emerald-500 transition-colors ${
                  link.href === "/"
                    ? pathname === "/" && "text-emerald-500"
                    : pathname.startsWith(link.href) && "text-emerald-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-2.5 shadow-sm flex items-center gap-4">
          {user ? (
            <ProfileTag
              {...profileProps}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                {user.email[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user.email.split("@")[0]}
              </span>
            </ProfileTag>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs font-bold bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
            >
              Get Started
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
