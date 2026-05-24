"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { HiOutlineXMark } from "react-icons/hi2";
import { base, sheet } from "@/constants/motion";
import { iconButton } from "@/components/ui/styles";

// One dialog for the whole app. Below md it is a bottom sheet (drag the handle down to dismiss);
// from md up it is a centered dialog. `variant="sheet"` forces the sheet everywhere.
// Always render it (pass `open`), so AnimatePresence can play the exit animation.

const MOBILE_QUERY = "(max-width: 767px)";
const subscribeMedia = (cb) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};
const readMobile = () => window.matchMedia(MOBILE_QUERY).matches;
const serverMobile = () => false;
const subscribeNoop = () => () => {};
const isClient = () => true;
const isServer = () => false;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = { sm: "md:max-w-sm", md: "md:max-w-lg", lg: "md:max-w-2xl", xl: "md:max-w-4xl" };

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  variant = "responsive",
  dismissible = true,
}) {
  const mounted = useSyncExternalStore(subscribeNoop, isClient, isServer);
  const mobile = useSyncExternalStore(subscribeMedia, readMobile, serverMobile);
  const asSheet = variant === "sheet" || mobile;
  const panelRef = useRef(null);
  const dragControls = useDragControls();
  const titleId = useId();
  const descId = useId();
  // Kept in a ref so a new onClose identity on re-render doesn't re-run the focus effect.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => [...(panel?.querySelectorAll(FOCUSABLE) ?? [])];
    (focusables()[0] ?? panel)?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape" && dismissible) onCloseRef.current?.();
      if (e.key !== "Tab") return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, dismissible]);

  if (!mounted) return null;

  const close = () => dismissible && onClose?.();

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="modal" className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={base}
            onClick={close}
          />
          <motion.dialog
            ref={panelRef}
            open
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={`relative m-0 flex max-h-[92dvh] w-full max-w-none flex-col p-0 border border-border bg-card text-card-foreground shadow-xl outline-none ${
              asSheet
                ? `rounded-t-lg border-b-0 pb-[env(safe-area-inset-bottom)] ${variant === "sheet" ? "md:max-w-lg" : ""}`
                : `max-h-[85dvh] rounded-lg ${SIZES[size] ?? SIZES.md}`
            }`}
            {...(asSheet
              ? {
                  initial: { y: "100%" },
                  animate: { y: 0 },
                  exit: { y: "100%" },
                  transition: sheet,
                  drag: dismissible ? "y" : false,
                  dragListener: false,
                  dragControls,
                  dragConstraints: { top: 0, bottom: 0 },
                  dragElastic: { top: 0, bottom: 0.6 },
                  onDragEnd: (_, { offset, velocity }) => {
                    if (offset.y > 120 || velocity.y > 500) close();
                  },
                }
              : {
                  initial: { opacity: 0, scale: 0.98, y: 8 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.98, y: 8 },
                  transition: base,
                })}
          >
            {asSheet && (
              <div
                className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-1 active:cursor-grabbing"
                onPointerDown={(e) => dismissible && dragControls.start(e)}
                aria-hidden="true"
              >
                <span className="h-1 w-10 rounded-full bg-border" />
              </div>
            )}
            {(title || dismissible) && (
              <div
                className={`flex shrink-0 items-start justify-between gap-4 px-5 ${asSheet ? "pt-1 pb-3" : "pt-5 pb-3"} touch-none`}
                onPointerDown={(e) => asSheet && dismissible && e.target === e.currentTarget && dragControls.start(e)}
              >
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="text-lg font-semibold">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descId} className="mt-0.5 text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                {dismissible && (
                  <button type="button" onClick={onClose} aria-label="Close" className={`${iconButton} -mr-2 -mt-1`}>
                    <HiOutlineXMark className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div>
            )}
          </motion.dialog>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
