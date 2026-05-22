import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <PublicNav />

      <main className="relative z-10 flex flex-1 flex-col">
        <Hero />
        <FeatureGrid />
        <HowItWorks />
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
          <Link href="/pricing" className="hover:text-text">Pricing</Link>
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
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center animate-fade-in">
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
            href="/pricing"
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
    { n: "02", title: "Tailor",  body: "Drop in the job description. Claude rewrites bullets to mirror the JD." },
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
        <div>
          © {new Date().getFullYear()} HireReady
        </div>
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
