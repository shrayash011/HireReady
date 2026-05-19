"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginResult } from "./actions";
import { OAuthButtons, OrDivider } from "@/components/auth/OAuthButtons";

const initial: LoginResult = {};

export default function LoginPage({
  searchParams
}: {
  searchParams: { next?: string; error?: string };
}) {
  const [state, formAction] = useFormState(loginAction, initial);
  const next = searchParams.next ?? "/dashboard";

  return (
    <div className="w-full max-w-sm">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-text-muted">Pick up where you left off.</p>
      </header>

      <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-6">
        {searchParams.error && (
          <p className="rounded-input border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
            {searchParams.error}
          </p>
        )}

        <OAuthButtons next={next} />

        <OrDivider label="or continue with email" />

        <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />

        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Field>

        <Field label="Password">
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Field>

        {state.error && (
          <p className="rounded-input border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
            {state.error}
          </p>
        )}

        <SubmitButton />
        </form>

        <p className="mt-2 text-center text-xs text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href={`/signup${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`} className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-input bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
    >
      {pending ? "Logging in…" : "Log in"}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>
      {children}
    </label>
  );
}
