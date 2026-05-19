"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

type Provider = "google" | "apple";

export function OAuthButtons({ next }: { next?: string }) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWith(provider: Provider) {
    setError(null);
    setLoading(provider);
    try {
      const supabase = createBrowserSupabase();
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const redirectTo = `${appUrl}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });
      if (error) throw error;
      // On success the SDK redirects the browser to the provider — nothing else to do.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => signInWith("google")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-input border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition hover:border-accent hover:bg-card disabled:opacity-50"
      >
        <GoogleIcon />
        {loading === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      <button
        type="button"
        onClick={() => signInWith("apple")}
        disabled={loading !== null}
        className="flex items-center justify-center gap-2 rounded-input border border-border bg-[#0a0a0a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50 dark:border-white/20"
      >
        <AppleIcon />
        {loading === "apple" ? "Redirecting…" : "Continue with Apple"}
      </button>

      {error && (
        <p className="rounded-input border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

export function OrDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-2 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.8 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.7 4.1 14.55 3.2 12 3.2 6.86 3.2 2.7 7.36 2.7 12.5S6.86 21.8 12 21.8c6.93 0 9.5-4.86 9.5-7.4 0-.5-.05-.88-.15-1.3z" fill="#4285F4" />
      <path d="M12 21.8c2.7 0 4.97-.9 6.62-2.43l-3.17-2.46c-.87.6-2.04 1.03-3.45 1.03-2.65 0-4.9-1.78-5.7-4.18l-3.28 2.53C4.7 19.5 8.1 21.8 12 21.8z" fill="#34A853" />
      <path d="M6.3 13.76A5.93 5.93 0 0 1 6 12.5c0-.43.07-.85.18-1.26L2.9 8.71A9.3 9.3 0 0 0 2.7 12.5c0 1.5.35 2.93.97 4.2l2.63-2.94z" fill="#FBBC05" />
      <path d="M12 6.55c1.5 0 2.5.65 3.07 1.2l2.27-2.21C15.97 4.1 14.13 3.2 12 3.2c-3.9 0-7.3 2.3-8.83 5.5l3.4 2.55C7.1 8.33 9.35 6.55 12 6.55z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
      <path d="M16.37 1.43c0 1.14-.41 2.13-1.23 2.97-.99 1-2.18 1.58-3.47 1.47-.04-1.06.41-2.16 1.21-3.04.85-.92 2.04-1.5 3.21-1.55.05.05.05.1.05.15.05 0 .23 0 .23 0zm3.78 16.62c-.68 1.58-1.51 3.16-2.81 4.4-.92.87-2.04 1.95-3.45 1.95-1.37.05-1.78-.81-3.66-.81-1.88 0-2.34.78-3.66.85-1.46.05-2.58-1.05-3.5-1.91C1.18 19.95-.7 14.2 1.85 10.25 3.13 8.3 5.5 7.06 7.93 7.06c1.42 0 2.76.97 3.66.97.85 0 2.49-1.16 4.2-.97.69.05 2.66.28 3.91 2.13-3.5 2.06-2.95 6.92.45 8.86z" />
    </svg>
  );
}
