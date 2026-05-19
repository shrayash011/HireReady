import type { Plan } from "@/types";
import { PricingTable } from "@/components/ui/PricingTable";

export const metadata = {
  title: "Pricing · HireReady"
};

const VALID: Plan[] = ["free", "pro", "premium"];

export default function PricingPage({
  searchParams
}: {
  searchParams: { highlight?: string; upgrade?: string };
}) {
  const highlight = (VALID as string[]).includes(searchParams.highlight ?? "")
    ? (searchParams.highlight as Plan)
    : undefined;

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <header className="text-center">
          <span className="text-xs uppercase tracking-widest text-text-muted">Pricing</span>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            Land the job. Skip the fluff.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted md:text-base">
            All plans include ATS-safe resumes and the AI tailoring that actually moves your score.
            Cancel anytime — no annual lock-in unless you choose yearly.
          </p>
        </header>

        {searchParams.upgrade === "cancelled" && (
          <div className="rounded-card border border-warn/40 bg-warn/10 p-3 text-center text-sm text-warn">
            Checkout cancelled. No charge made.
          </div>
        )}

        <PricingTable highlight={highlight} />

        <FAQ />
      </div>
    </div>
  );
}

function FAQ() {
  const qs: { q: string; a: string }[] = [
    {
      q: "Can I cancel anytime?",
      a: "Yes. Cancel from the billing portal and you'll keep Pro/Premium features until the end of the period."
    },
    {
      q: "What payment methods do you accept?",
      a: "Anything Stripe accepts — Visa, Mastercard, Amex, Apple Pay, Google Pay, and most regional methods."
    },
    {
      q: "Do you offer student or regional pricing?",
      a: "Not yet, but yearly billing already gives a ~22% discount. Email hello@hireready.com if you're a student or in a market where pricing is a blocker — we read everything."
    },
    {
      q: "Is my data secure?",
      a: "Resumes are stored encrypted in Supabase, only visible to you. We never train on your data. Voice recordings are transcribed and deleted within 24 hours."
    }
  ];
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-center text-lg font-semibold">Frequently asked</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {qs.map((it) => (
          <div key={it.q} className="rounded-card border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">{it.q}</h3>
            <p className="mt-1 text-xs text-text-muted">{it.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
