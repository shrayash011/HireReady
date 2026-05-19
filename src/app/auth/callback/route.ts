import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

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
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      dest(`/login?error=${encodeURIComponent(error.message)}`)
    );
  }

  return NextResponse.redirect(dest(next));
}
