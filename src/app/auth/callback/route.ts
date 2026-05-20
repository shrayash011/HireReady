import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { sendEmail, welcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * OAuth redirect target. Supabase redirects here with `?code=...` after the
 * provider sign-in. We exchange the code for a session (which sets the auth
 * cookies via createServerSupabase) and then send the user on to `next`.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const errorDesc = url.searchParams.get("error_description");

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const dest = (path: string) => new URL(path.startsWith("/") ? path : `/${path}`, appOrigin);

  if (errorDesc) {
    return NextResponse.redirect(
      dest(`/login?error=${encodeURIComponent(errorDesc)}`)
    );
  }

  if (!code) {
    return NextResponse.redirect(dest("/login?error=missing_code"));
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      dest(`/login?error=${encodeURIComponent(error.message)}`)
    );
  }

  // First-time OAuth signups: created_at ≈ now → fire welcome email.
  const user = data?.user;
  const createdAt = user?.created_at ? new Date(user.created_at).getTime() : 0;
  const isNew = user && Date.now() - createdAt < 60_000;
  if (isNew && user.email) {
    const name = (user.user_metadata?.full_name as string | undefined) ?? "";
    const { subject, html, text } = welcomeEmail(name, user.email);
    sendEmail({ to: user.email, subject, html, text }).catch(() => {});
  }

  return NextResponse.redirect(dest(next));
}
