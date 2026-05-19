"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signupAction, type SignupResult } from "./actions";
import { OAuthButtons, OrDivider } from "@/components/auth/OAuthButtons";

const initial: SignupResult = {};

export default function SignupPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const [state, formAction] = useFormState(signupAction, initial);

  if (state.needsConfirmation) {
    return (
      <div className="w-full max-w-sm rounded-card border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold">Check your inbox</h1>
        <p className="mt-2 text-sm text-text-muted">
          We just sent a confirmation link. Click it to finish signing up, then come back and log in.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block rounded-input bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-text-muted">Two free resumes — no card needed.</p>
      </header>

      <div className="flex flex-col gap-3 rounded-card border border-border bg-card p-6">
        <OAuthButtons next={searchParams.next ?? "/dashboard"} />

        <OrDivider label="or sign up with email" />

        <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={searchParams.next ?? "/dashboard"} />

        <Field label="Full name">
          <input
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Field>

        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Field>

        <Field label="Password" hint="Minimum 8 characters">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
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
          Already have an account?{" "}
          <Link href={`/login${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`} className="text-accent hover:underline">
            Log in
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
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-text-muted">{hint}</span>}
    </label>
  );
}
