import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = createServerSupabase();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json(
        { error: { code: "auth_required", message: "Sign in to manage billing." } },
        { status: 401 }
      );
    }

    const profile = await (supabase.from("users") as unknown as {
      select: (cols: string) => { eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { stripe_customer_id: string | null } | null }> } };
    }).select("stripe_customer_id").eq("id", user.id).maybeSingle();

    const customerId = profile.data?.stripe_customer_id;
    if (!customerId) {
      return NextResponse.json({ error: "No billing account yet." }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`
    });

    return NextResponse.json({ data: { url: session.url }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
