"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import { sendEmail, welcomeEmail } from "@/lib/email";

export interface SignupResult {
  error?: string;
  needsConfirmation?: boolean;
}

export async function signupAction(_prev: SignupResult, formData: FormData): Promise<SignupResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });

  if (error) return { error: error.message };

  // Fire-and-forget welcome email — failures don't block signup.
  const { subject, html, text } = welcomeEmail(fullName, email);
  sendEmail({ to: email, subject, html, text }).catch(() => {});

  // If email confirmation is on, session is null until the user clicks the link.
  if (!data.session) {
    return { needsConfirmation: true };
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}
