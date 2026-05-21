"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { HiOutlineArrowRightOnRectangle, HiOutlineXMark } from "react-icons/hi2";

// Confirm-then-logout dialog. Uses theme tokens only, so it reads correctly in light and dark mode.
// When `busy` is true it shows a spinner with a status message instead of the buttons.
const subscribeNoop = () => () => {};
const isClient = () => true;
const isServer = () => false;

export default function LogoutModal({ open, busy = false, onCancel, onConfirm }) {
  const cancelRef = useRef(null);
  // document only exists in the browser, so the portal waits until the component has mounted there.
  const mounted = useSyncExternalStore(subscribeNoop, isClient, isServer);

  useEffect(() => {
    if (!open || busy) return;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="logout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={busy ? undefined : onCancel}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-busy={busy}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl"
          >
            {busy ? (
              <div role="status" className="flex flex-col items-center gap-4 py-4 text-center">
                <span
                  aria-hidden="true"
                  className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500"
                />
                <p id="logout-title" className="text-sm font-semibold">Logging you out...</p>
                <p className="text-xs text-muted-foreground">Clearing your session on this device.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10">
                    <HiOutlineArrowRightOnRectangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                  </span>
                  <button
                    type="button"
                    onClick={onCancel}
                    aria-label="Close"
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <HiOutlineXMark className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <h2 id="logout-title" className="text-lg font-semibold">Log out of DeepScreen?</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  You will need to sign in again to reach your dashboard.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    ref={cancelRef}
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    Stay signed in
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
