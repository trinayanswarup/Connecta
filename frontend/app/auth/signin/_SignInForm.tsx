"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Lock, Mail, Wifi } from "lucide-react";

type SignInFormProps = {
  destination: string | null;
  error?: string;
  next: string;
};

const demoEmail = "connecta@gmail.com";
const demoPassword = "connectawebsite";

export function SignInForm({ destination, error: initialError, next }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function handleDemoLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError("Enter the demo email and password to continue.");
      return;
    }

    setLoading(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    if (!supabase) {
      setLoading(false);
      setAuthError("Supabase is not configured for this environment.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setLoading(false);

    if (error) {
      setAuthError("Those demo credentials did not work. Check the email and password, then try again.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-5 py-16">
      <div className="w-full max-w-md">
        <Link className="mb-10 flex items-center justify-center gap-2" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white shadow-sm">
            <Wifi className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">Connecta</span>
        </Link>

        <div className="rounded-lg bg-white p-8 shadow-[0_24px_88px_-78px_rgba(15,23,42,0.42)]">
          <div className="text-center">
            <p className="text-sm font-semibold text-orange-700">Demo login for reviewers</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {destination ? `Review the ${destination} eSIM flow` : "Sign in to Connecta"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use the Supabase demo account below to access protected checkout and account screens.
            </p>
          </div>

          <div className="mt-7 rounded-md bg-[#fff4e8] p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold text-slate-950">{demoEmail}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-slate-500">Password</span>
              <span className="font-semibold text-slate-950">{demoPassword}</span>
            </div>
          </div>

          {initialError === "auth" ? (
            <AuthMessage>Something went wrong. Please sign in again.</AuthMessage>
          ) : null}

          {!supabaseConfigured ? (
            <AuthMessage>Supabase is not configured in this environment, so demo login is unavailable.</AuthMessage>
          ) : null}

          {authError ? <AuthMessage>{authError}</AuthMessage> : null}

          <form className="mt-6 grid gap-3" onSubmit={handleDemoLogin}>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email
              <span className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={demoEmail}
                  required
                  type="email"
                  value={email}
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Password
              <span className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoComplete="current-password"
                  className="w-full rounded-md border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={demoPassword}
                  required
                  type="password"
                  value={password}
                />
              </span>
            </label>

            <button
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-slate-950 text-sm font-semibold text-white shadow-[0_18px_54px_-38px_rgba(15,23,42,0.65)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !supabaseConfigured}
              type="submit"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Sign in with demo account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Demo access is handled by Supabase Auth. Public signup and direct trip-table access should stay disabled.
          </p>
        </div>
      </div>
    </main>
  );
}

function AuthMessage({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex items-center gap-2.5 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {children}
    </div>
  );
}
