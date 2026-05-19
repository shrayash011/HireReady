import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/lib/supabase";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_PAGES = new Set(["/login", "/signup"]);

export async function middleware(req: NextRequest) {
  const { supabase, response } = createMiddlewareSupabase(req);

  // Touch getUser so the session cookie is refreshed on every request.
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  const { pathname, search } = req.nextUrl;

  // Gate /dashboard/* — bounce unauthenticated users to /login with ?next=.
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // If already signed in, skip the auth pages.
  if (user && AUTH_PAGES.has(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on every request except static assets and the Stripe webhook (raw body).
    "/((?!_next/static|_next/image|favicon.ico|api/billing/webhook).*)"
  ]
};
