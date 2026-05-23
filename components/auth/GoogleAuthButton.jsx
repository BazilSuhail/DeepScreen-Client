"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/authStore";
import { getGoogleUnavailableMessage, renderGoogleButton } from "@/utils/googleAuth";

// Shared "Continue with Google" / "Sign up with Google" button.
// The official Google button sits invisibly on top of the styled one, so clicks go to Google.
export default function GoogleAuthButton({ label, onSuccess, onError, disabled = false }) {
  const [busy, setBusy] = useState(false);
  const googleButtonRef = useRef(null);
  const callbacks = useRef({ onSuccess, onError });
  const { loginWithGoogle } = useAuth();
  // Same value on server and client (NEXT_PUBLIC_* is inlined at build), so the first render matches.
  const unavailableMessage = getGoogleUnavailableMessage();
  const isDisabled = busy || disabled || Boolean(unavailableMessage);

  useEffect(() => {
    callbacks.current = { onSuccess, onError };
  });

  useEffect(() => {
    const container = googleButtonRef.current;
    if (!container) return;

    let active = true;

    renderGoogleButton(container, {
      onCredential: async (credential) => {
        if (!active) return;
        setBusy(true);
        try {
          const data = await loginWithGoogle(credential);
          if (active) callbacks.current.onSuccess?.(data);
        } catch (err) {
          if (!active) return;
          setBusy(false);
          callbacks.current.onError?.(err);
        }
      },
      onError: (message) => {
        if (active) callbacks.current.onError?.(message);
      },
    }).catch((err) => {
      // A missing client ID is shown on the disabled button, not as an error banner.
      if (active && !getGoogleUnavailableMessage()) callbacks.current.onError?.(err);
    });

    return () => {
      active = false;
    };
  }, [loginWithGoogle]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden" title={unavailableMessage || undefined}>
      <div className={`relative w-full ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="w-full py-3.5 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-sm font-semibold transition-all flex items-center justify-center gap-3 select-none shadow-sm cursor-pointer">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#34d399" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34d399" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#34d399" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#34d399" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {label}
        </div>

        {/* Real Google button (transparent, bounds strictly within this wrapper) */}
        <div ref={googleButtonRef} className="absolute inset-0 z-10 cursor-pointer opacity-0" />
      </div>

      {busy && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/80 rounded-xl">
          <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
