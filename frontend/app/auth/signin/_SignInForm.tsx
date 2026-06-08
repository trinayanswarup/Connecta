"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, Wifi } from "lucide-react";

type SignInFormProps = {
  destination: string | null;
  error?: string;
  next: string;
};

export function SignInForm({ destination, error: initialError, next }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState<"google" | "apple" | "email" | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  function handleGuestContinue() {
    localStorage.setItem("connecta_guest_session", "guest@connecta.dev");
    router.push(next);
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(provider);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (!supabase) { setLoading(null); return; }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setLoading(null);
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailError(null);
    setLoading("email");
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (!supabase) { setLoading(null); return; }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: true,
      },
    });
    setLoading(null);
    if (error) {
      setEmailError(error.message);
    } else {
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-5 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-full bg-emerald-50 ring-4 ring-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Check your email</h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            We sent a sign-in link to{" "}
            <span className="font-semibold text-slate-950">{email}</span>.
            <br />
            Click the link in the email to continue.
          </p>
          <button
            className="mt-8 text-sm font-semibold text-teal-600 transition hover:text-teal-700"
            onClick={() => setEmailSent(false)}
            type="button"
          >
            Use a different email
          </button>
        </div>
      </main>
    );
  }

  if (!supabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-5 py-16">
        <div className="w-full max-w-md">
          <Link className="mb-10 flex items-center justify-center gap-2" href="/">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Wifi className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-950">Connecta</span>
          </Link>
          <div className="rounded-2xl bg-white p-8 shadow-[0_24px_88px_-78px_rgba(15,23,42,0.42)] ring-1 ring-slate-200/60 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {destination ? `Get your ${destination} eSIM` : "Sign in to Connecta"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {destination
                ? "Continue to checkout as a guest."
                : "Continue without signing in."}
            </p>
            <button
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              onClick={handleGuestContinue}
              type="button"
            >
              Continue as guest
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-5 text-xs text-slate-400">
              Google and Apple sign-in will be available once the app is connected to Supabase.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-5 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link className="mb-10 flex items-center justify-center gap-2" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Wifi className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">Connecta</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-[0_24px_88px_-78px_rgba(15,23,42,0.42)] ring-1 ring-slate-200/60">
          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {destination ? `Get your ${destination} eSIM` : "Sign in to Connecta"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {destination
                ? "Sign in or create a free account to continue."
                : "Access your trips, orders, and eSIM details."}
            </p>
          </div>

          {/* Auth error banner */}
          {initialError === "auth" && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Something went wrong. Please try again.
            </div>
          )}

          {/* OAuth buttons */}
          <div className="grid gap-3">
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-semibold text-slate-950 shadow-[inset_0_0_0_1.5px_rgba(148,163,184,0.55)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading !== null}
              onClick={() => handleOAuth("google")}
              type="button"
            >
              {loading === "google" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>

            <button
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading !== null}
              onClick={() => handleOAuth("apple")}
              type="button"
            >
              {loading === "apple" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <AppleIcon />
              )}
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs font-medium text-slate-400">or use your email</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Email magic link */}
          <form onSubmit={handleEmail}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                title="Email address"
                type="email"
                value={email}
              />
            </div>

            {emailError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {emailError}
              </p>
            )}

            <button
              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading !== null}
              type="submit"
            >
              {loading === "email" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Send sign-in link
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to our{" "}
            <span className="font-medium text-slate-600">Terms of Service</span> and{" "}
            <span className="font-medium text-slate-600">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 fill-white" viewBox="0 0 24 24">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.23.72 3 .76 1.13-.23 2.21-.93 3.41-.83 1.44.12 2.52.69 3.23 1.75-2.97 1.82-2.27 5.88.48 7.05-.57 1.46-1.32 2.9-2.12 4.15zM13 3.5c.12 1.96-1.44 3.5-3.28 3.67-.18-1.93 1.44-3.5 3.28-3.67z" />
    </svg>
  );
}
