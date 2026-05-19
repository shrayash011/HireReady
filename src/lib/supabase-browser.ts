"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

/**
 * Lives in its own file so client components don't accidentally pull in the
 * server-only helpers in lib/supabase.ts (which import next/headers).
 */
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient<Database>(url, anon);
}
