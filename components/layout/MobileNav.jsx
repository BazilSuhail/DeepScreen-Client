"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  HiOutlineBars3,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBuildingOffice2,
  HiOutlineChevronRight,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";
import { MOBILE_TABS } from "@/constants/layout";
import { spring, fast } from "@/constants/motion";
import { focusRing } from "@/components/ui/styles";
import Modal from "@/components/ui/Modal";
import { IconMap } from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import LogoutModal from "./LogoutModal";

const MotionLink = motion.create(Link);

function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-card bg-red-500 px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

// Mobile-only (below md) navigation: a bottom tab bar with the role's top destinations,
// plus a menu button that opens the full navigation in a bottom sheet.
export default function MobileNav({ nav }) {
  const { user, role, roleMenu, org, resolvePath, isActive, unreadCount, messagesHref, profileHref, initials, displayName, loggingOut, handleLogout } = nav;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const staffWithoutOrg = role === "STAFF" && !org;
  const menuItems = roleMenu.flatMap((s) => s.items);
  const tabs = staffWithoutOrg
    ? [{ name: "Create Org", Icon: HiOutlineBuildingOffice2, href: "/organizations/create", active: false }]
    : (MOBILE_TABS[role] || [])
        .map(({ path, label }) => ({ label, item: menuItems.find((i) => i.path === path) }))
        .filter(({ item }) => item)
        .map(({ label, item }) => ({
          name: label,
          Icon: IconMap[item.icon],
          href: resolvePath(item.path),
          active: isActive(item.path),
        }));
  if (role !== "STAFF") {
    tabs.push({ name: "Messages", Icon: HiOutlineChatBubbleLeftRight, href: messagesHref, badge: unreadCount });
  }

  const ProfileTag = role === "STAFF" ? "div" : Link;
  const profileProps = role === "STAFF" ? {} : { href: profileHref, onClick: () => setSheetOpen(false) };

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid h-16" style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}>
          {tabs.map(({ name, Icon, href, active, badge }) => (
            <li key={href} className="flex">
              <MotionLink
                href={href}
                aria-current={active ? "page" : undefined}
                whileTap={{ scale: 0.94 }}
                transition={fast}
                className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${focusRing} focus-visible:ring-offset-0 ${
                  active ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-tab-indicator"
                    transition={spring}
                    className="absolute top-2 h-8 w-14 rounded-md bg-emerald-500/10"
                    aria-hidden="true"
                  />
                )}
                <span className="relative">
                  {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
                  <UnreadBadge count={badge} />
                </span>
                <span className="relative max-w-full truncate px-1">{name}</span>
              </MotionLink>
            </li>
          ))}
          <li className="flex">
            <motion.button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              whileTap={{ scale: 0.94 }}
              transition={fast}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground ${focusRing} focus-visible:ring-offset-0`}
            >
              <HiOutlineBars3 className="h-5 w-5" aria-hidden="true" />
              <span>Menu</span>
            </motion.button>
          </li>
        </ul>
      </nav>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="Menu" variant="sheet">
        <div className="space-y-5">
          <ProfileTag
            {...profileProps}
            className={`flex items-center gap-3 rounded-md border border-border p-3 ${role === "STAFF" ? "" : "transition-colors hover:bg-muted"} ${focusRing}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-100 font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">
              {user?.google_picture ? (
                <Image src={user.google_picture} alt="" width={40} height={40} unoptimized className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
            </span>
            {role !== "STAFF" && <HiOutlineChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
          </ProfileTag>

          {role === "STAFF" && (
            <Link
              href={org ? `/organizations/${org.slug}` : "/organizations/create"}
              onClick={() => setSheetOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-md border border-emerald-500/20 px-3 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 ${focusRing}`}
            >
              <HiOutlineBuildingOffice2 className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex-1 truncate">{org ? org.name : "Create Organization"}</span>
              <HiOutlineChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}

          {!staffWithoutOrg &&
            roleMenu.map((section) => (
              <section key={section.title}>
                <h3 className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = IconMap[item.icon];
                    const active = isActive(item.path);
                    return (
                      <li key={item.name}>
                        <Link
                          href={resolvePath(item.path)}
                          onClick={() => setSheetOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${focusRing} ${
                            active
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                setSheetOpen(false);
                setLogoutOpen(true);
              }}
              className={`inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-destructive/10 dark:text-red-400 ${focusRing}`}
            >
              <HiArrowRightOnRectangle className="h-5 w-5" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </Modal>

      <LogoutModal open={logoutOpen} busy={loggingOut} onCancel={() => setLogoutOpen(false)} onConfirm={handleLogout} />
    </>
  );
}
