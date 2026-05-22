import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata = {
  title: "HireReady — Beat the ATS. Land the interview.",
  description:
    "AI-powered resume builder, ATS scorer, cover letter writer, and mock interview coach — all in one app. Built for global job seekers.",
  openGraph: {
    title: "HireReady — Beat the ATS. Land the interview.",
    description:
      "AI-powered resume builder, ATS scorer, cover letter writer, and mock interview coach — all in one app.",
    type: "website"
  }
};

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <PublicNav />

      <main className="relative z-10 flex flex-1 flex-col">
        <Hero />
        <AppPreview />
        <TrustedBy />
        <FeatureGrid />
        <HowItWorks />
        <PricingTeaser />
        <FAQ />
        <FinalCTA />
      </main>

      <PublicFooter />
    </div>
  );
}

/* ---------- Nav ---------- */

function PublicNav() {
  return (
    <header className="relative z-20 border-b border-border/60 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          <span className="text-accent">Hire</span>Ready
        </Link>
        <nav className="hidden items-center gap-6 text-xs text-text-muted md:flex">
          <Link href="#features" className="hover:text-text">Features</Link>
          <Link href="#how" className="hover:text-text">How it works</Link>
          <Link href="#pricing" className="hover:text-text">Pricing</Link>
          <Link href="#faq" className="hover:text-text">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-input border border-border bg-surface px-3 py-1.5 text-xs text-text-muted hover:border-accent hover:text-accent sm:inline-block"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-input bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative">
      <div className="hero-glow" aria-hidden />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-12 text-center animate-fade-in">
        <span className="rounded-pill border border-border bg-card/60 px-4 py-1 text-[11px] uppercase tracking-widest text-text-muted backdrop-blur">
          AI-powered job application suite
        </span>

        <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          Beat the ATS.<br />
          <span className="gradient-text">Land the interview.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-text-muted md:text-lg">
          HireReady builds ATS-safe resumes, scores them against the job description,
          writes tailored cover letters, and coaches you through mock interviews — all in one place.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-input bg-accent px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-accent-hover hover:shadow-lift"
          >
            Get started — free
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="#pricing"
            className="rounded-input border border-border bg-surface/80 px-6 py-3 text-sm font-medium text-text backdrop-blur transition hover:border-accent hover:text-accent"
          >
            See pricing
          </Link>
        </div>

        <p className="mt-4 text-xs text-text-muted">
          No card required · 2 free resumes · Cancel anytime
        </p>

        <HeroStats />
      </div>
    </section>
  );
}

function HeroStats() {
  const items = [
    { value: "75%", label: "of resumes rejected by ATS before a human reads them" },
    { value: "4×",   label: "more interviews when bullets are quantified" },
    { value: "10 min", label: "from raw inputs to an ATS-safe PDF" }
  ];
  return (
    <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="card-elevated hover-lift rounded-card p-4 text-center"
        >
          <div className="text-2xl font-semibold tracking-tight text-text">{it.value}</div>
          <div className="mt-1 text-[11px] leading-snug text-text-muted">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- App preview (HTML/CSS mock of the real app) ---------- */

function AppPreview() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-20">
      <div className="rounded-card border border-border bg-card p-2 shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-bad/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-good/60" />
          <span className="ml-3 text-[10px] text-text-muted">hireready.com/dashboard/resume/new</span>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-[1fr_18rem]">
          {/* Mock resume */}
          <div className="rounded-input bg-white p-6 text-[#111]">
            <div className="border-b border-gray-300 pb-2">
              <h3 className="text-lg font-bold tracking-tight">Aanya Sharma</h3>
              <p className="mt-0.5 text-[10px] text-gray-700">
                aanya.sharma@email.com · +91 98765 43210 · Bengaluru, India · linkedin.com/in/aanya
              </p>
            </div>

            <div className="mt-3 text-[10px]">
              <h4 className="font-bold uppercase tracking-wider text-gray-700">Summary</h4>
              <p className="mt-0.5 leading-snug text-gray-800">
                Senior backend engineer with 6 years building payment infrastructure at scale.
                Led migration from monolith to event-driven services across 4 product lines.
              </p>
            </div>

            <div className="mt-3 text-[10px]">
              <h4 className="font-bold uppercase tracking-wider text-gray-700">Experience</h4>
              <div className="mt-1.5">
                <div className="flex justify-between">
                  <strong className="text-[10px]">Senior Software Engineer</strong>
                  <span className="text-[9px] text-gray-600">Jan 2022 – Present</span>
                </div>
                <div className="text-[9.5px] text-gray-700">Razorpay · Bengaluru</div>
                <ul className="ml-3 mt-1 list-disc text-[9px] leading-snug text-gray-800">
                  <li>Led migration to event-driven architecture, cutting p95 latency 38%</li>
                  <li>Mentored 5 engineers from junior to mid-level in 12 months</li>
                  <li>Designed Kafka-based reconciliation pipeline handling $2M/day</li>
                </ul>
              </div>
              <div className="mt-2">
                <div className="flex justify-between">
                  <strong className="text-[10px]">Software Engineer II</strong>
                  <span className="text-[9px] text-gray-600">Jun 2019 – Dec 2021</span>
                </div>
                <div className="text-[9.5px] text-gray-700">Flipkart · Bengaluru</div>
                <ul className="ml-3 mt-1 list-disc text-[9px] leading-snug text-gray-800">
                  <li>Built order-confirmation service serving 4M req/day at p99 &lt; 80ms</li>
                </ul>
              </div>
            </div>

            <div className="mt-3 text-[10px]">
              <h4 className="font-bold uppercase tracking-wider text-gray-700">Skills</h4>
              <p className="text-[9.5px] text-gray-800">Go · TypeScript · Postgres · Kafka · Kubernetes · Redis · AWS</p>
            </div>
          </div>

          {/* Mock ATS panel */}
          <div className="flex flex-col gap-2">
            <div className="rounded-input border border-border bg-surface p-3">
              <div className="text-[10px] uppercase tracking-widest text-text-muted">ATS Score</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-good">87</span>
                <span className="text-sm text-text-muted">/100</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-card">
                <div className="h-full bg-good" style={{ width: "87%" }} />
              </div>
              <p className="mt-2 text-[10px] leading-snug text-text-muted">
                Strong keyword match. Two weak bullets identified.
              </p>
            </div>

            <div className="rounded-input border border-border bg-surface p-3">
              <div className="text-[10px] uppercase tracking-widest text-text-muted">Matched keywords</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {["TypeScript", "Postgres", "Kafka", "Microservices", "k8s"].map((k) => (
                  <span key={k} className="rounded-pill bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                    {k}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-input border border-border bg-surface p-3">
              <div className="text-[10px] uppercase tracking-widest text-text-muted">Missing</div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {["Terraform", "gRPC"].map((k) => (
                  <span key={k} className="rounded-pill bg-warn/10 px-2 py-0.5 text-[10px] text-warn">
                    {k}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] leading-snug text-text-muted">
                Add to summary if you have hands-on experience.
              </p>
            </div>

            <div className="rounded-input border border-accent/40 bg-accent/5 p-3">
              <div className="text-[10px] uppercase tracking-widest text-accent">One tip</div>
              <p className="mt-1 text-[10.5px] leading-snug">
                Quantify the Flipkart bullet — current scope (&quot;4M req/day&quot;) is great, add a business
                outcome.
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-text-muted">
        Live ATS feedback as you build — not after you submit.
      </p>
    </section>
  );
}

/* ---------- Trusted-by ATS bar ---------- */

function TrustedBy() {
  return (
    <section className="border-y border-border/60 bg-surface/40 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">
          Tested against the ATS systems used by 80% of corporate hiring
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-semibold text-text-muted">
          <span>Workday</span>
          <span>Greenhouse</span>
          <span>Lever</span>
          <span>Taleo</span>
          <span>iCIMS</span>
          <span>BambooHR</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Feature grid ---------- */

function FeatureGrid() {
  const features = [
    {
      title: "Resume builder",
      body: "Six guided steps, three ATS-safe templates, live preview. No formatting that breaks Workday or Greenhouse.",
      icon: <FileIcon />
    },
    {
      title: "ATS scoring",
      body: "Paste the job description. Get a 0–100 score, missing keywords, and the exact bullets that need rewriting.",
      icon: <GaugeIcon />
    },
    {
      title: "Cover letters",
      body: "One-click, role-specific cover letters that don't read like a template. No 'I am passionate about'.",
      icon: <MailIcon />
    },
    {
      title: "Mock interviews",
      body: "10 questions tuned to your role and level. STAR feedback per answer, plus a model answer to learn from.",
      icon: <MicIcon />
    }
  ];

  return (
    <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <header className="mb-10 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">Features</span>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Everything you need to land the interview
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted md:text-base">
          Four tools, one flow. No more juggling Word docs, ATS scanners, and prep apps.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="card-elevated hover-lift group rounded-card p-5"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-input bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
              {f.icon}
            </div>
            <h3 className="text-sm font-semibold">{f.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Build", body: "Paste your background or start fresh. Six steps, no tedious formatting." },
    { n: "02", title: "Tailor",  body: "Drop in the job description (or paste a URL). Claude rewrites bullets to mirror the JD." },
    { n: "03", title: "Practice", body: "Run a mock interview with feedback. Walk into the real one ready." }
  ];

  return (
    <section id="how" className="relative border-y border-border/60 bg-surface/40">
      <div className="mx-auto w-full max-w-5xl px-6 py-20">
        <header className="mb-12 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">How it works</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps. About fifteen minutes.</h2>
        </header>

        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="card-elevated hover-lift rounded-card p-6">
              <span className="text-xs font-mono text-accent">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Pricing teaser ---------- */

function PricingTeaser() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      sub: "Forever",
      features: ["2 resumes", "3 ATS checks/day", "1 cover letter", "Watermarked PDF"],
      cta: "Start free",
      href: "/signup",
      highlight: false
    },
    {
      name: "Pro",
      price: "$9",
      sub: "per month",
      features: [
        "Unlimited resumes",
        "Unlimited ATS checks",
        "Unlimited cover letters",
        "Clean PDF",
        "Text mock interviews"
      ],
      cta: "Go Pro",
      href: "/pricing",
      highlight: true
    },
    {
      name: "Premium",
      price: "$29",
      sub: "per month",
      features: ["Everything in Pro", "Voice mock interviews", "LinkedIn import", "Priority support"],
      cta: "Go Premium",
      href: "/pricing",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <header className="mb-10 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">Pricing</span>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Simple, honest pricing</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted">
          Start free. Upgrade only if you need more.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-card border p-6 ${
              p.highlight ? "border-accent bg-accent/5 shadow-lift" : "border-border bg-card"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-2 right-4 rounded-pill bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                Most popular
              </span>
            )}
            <div className="text-xs uppercase tracking-widest text-text-muted">{p.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold">{p.price}</span>
              <span className="text-xs text-text-muted">{p.sub}</span>
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-accent">✓</span>
                  <span className="text-text-muted">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={p.href}
              className={`mt-6 block rounded-input px-4 py-2.5 text-center text-sm font-medium transition ${
                p.highlight
                  ? "bg-accent text-white hover:bg-accent-hover"
                  : "border border-border bg-surface hover:border-accent hover:text-accent"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-text-muted">
        Annual plans available — 2 months free.{" "}
        <Link href="/pricing" className="text-accent hover:underline">
          Compare all plans →
        </Link>
      </p>
    </section>
  );
}

/* ---------- FAQ ---------- */

function FAQ() {
  const faqs = [
    {
      q: "Will this actually get me past the ATS?",
      a: "We test our templates against Workday, Greenhouse, Lever, and Taleo — the systems behind ~80% of corporate job applications. Our ATS scorer mirrors how those systems parse resumes. A score of 75+ means you're in the top 25% of submissions for that role."
    },
    {
      q: "Is my data safe?",
      a: "Yes. Resume content stays in your account and is never used to train AI models. We use Anthropic's Claude API (no training on customer data) and Supabase with Row Level Security so only you can read your own data. Full details in our Privacy Policy."
    },
    {
      q: "How is this different from ChatGPT or Resume.io?",
      a: "ChatGPT doesn't know what an ATS looks for. Resume.io has nice templates but doesn't tailor to the job description. HireReady combines AI tailoring, ATS scoring, cover letters, and interview prep — built on Claude (Anthropic's strongest model) and tuned for ATS systems."
    },
    {
      q: "Can I use this for international job applications?",
      a: "Yes — HireReady is built for global job seekers, with a focus on South Asia, Middle East, Africa, and remote-friendly roles. Templates work for US, UK, EU, and Indian resume conventions. CV vs résumé formatting is selectable per resume."
    },
    {
      q: "What happens if I cancel?",
      a: "You can cancel any time from Settings → Billing. Paid features remain active until the end of your current billing period. Your data is kept (you can come back later) until you choose to delete your account."
    },
    {
      q: "Do you offer a refund?",
      a: "Yes — within 3 days of your first monthly payment, or 7 days for annual plans. Full details in our Refund Policy."
    }
  ];

  return (
    <section id="faq" className="relative border-y border-border/60 bg-surface/40">
      <div className="mx-auto w-full max-w-3xl px-6 py-20">
        <header className="mb-10 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-accent">FAQ</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Questions, answered</h2>
        </header>

        <div className="flex flex-col gap-2">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-card border border-border bg-card p-4 transition hover:border-accent/40 open:border-accent/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                {f.q}
                <span className="text-lg text-text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-text-muted">
          Other questions?{" "}
          <a href="mailto:hireready011@gmail.com" className="text-accent hover:underline">
            hireready011@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */

function FinalCTA() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-24 text-center">
      <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
        Your next interview is one upload away.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm text-text-muted md:text-base">
        Start free. Build two resumes, run three ATS checks, write a cover letter — all without entering a card.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/signup"
          className="group inline-flex items-center gap-2 rounded-input bg-accent px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:bg-accent-hover hover:shadow-lift"
        >
          Start free
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
        <Link
          href="/pricing"
          className="rounded-input border border-border bg-surface px-6 py-3 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
        >
          Compare plans
        </Link>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-bg/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-text-muted md:flex-row">
        <div>© {new Date().getFullYear()} HireReady</div>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/pricing" className="hover:text-text">Pricing</Link>
          <Link href="/login" className="hover:text-text">Log in</Link>
          <Link href="/signup" className="hover:text-text">Sign up</Link>
          <span className="text-border" aria-hidden>·</span>
          <Link href="/terms" className="hover:text-text">Terms</Link>
          <Link href="/privacy" className="hover:text-text">Privacy</Link>
          <Link href="/refund" className="hover:text-text">Refund</Link>
        </nav>
      </div>
    </footer>
  );
}

/* ---------- Icons ---------- */

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}
function GaugeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M12 14l4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6 12 13 2 6" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
  );
}
