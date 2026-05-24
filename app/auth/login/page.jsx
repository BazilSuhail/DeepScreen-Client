"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUserPlus, HiOutlineArrowRight, HiOutlineArrowPath } from "react-icons/hi2";
import AuthLayout from "@/components/auth/AuthLayout";
import FormError from "@/components/auth/FormError";
import { TextField } from "@/components/forms/FormFields";
import { primaryButton, secondaryButton } from "@/components/ui/styles";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { getPostAuthPath } from "@/utils/authRoutes";
import { completeDesktopHandoff } from "@/utils/desktopHandoff";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      router.push(getPostAuthPath(data));
    } catch (err) {
      setError(getAuthErrorMessage(err, "Something went wrong while signing in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout maxWidth="max-w-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your DeepScreen account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError title="Couldn't sign you in" message={error} onDismiss={() => setError("")} />

        <TextField
          id="login-email"
          label="Email"
          icon={HiOutlineEnvelope}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <TextField
          id="login-password"
          label="Password"
          icon={HiOutlineLockClosed}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button type="submit" disabled={loading} aria-busy={loading} className={`${primaryButton} group w-full`}>
          {loading ? (
            <>
              <HiOutlineArrowPath className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <HiOutlineArrowRight className="h-4 w-4 transition-[translate] duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton
        label="Continue with Google"
        disabled={loading}
        onSuccess={(data) => {
          if (!completeDesktopHandoff(data)) router.push(getPostAuthPath(data));
        }}
        onError={(err) => setError(getAuthErrorMessage(err, "Google sign-in failed. Please try again."))}
      />

      <div className="mt-8 border-t border-border pt-6 text-center">
        <Link href="/auth/register" className={`${secondaryButton} w-full`}>
          <HiOutlineUserPlus className="h-4 w-4" aria-hidden="true" />
          Create a candidate account
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">Recruiters and staff join by invitation or the staff portal.</p>
      </div>
    </AuthLayout>
  );
}
