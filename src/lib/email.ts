import "server-only";
import { Resend } from "resend";

let _client: Resend | null = null;

function getClient(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.RESEND_FROM ?? "HireReady <noreply@hireready.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface SendResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * Best-effort transactional send. If RESEND_API_KEY is missing (local dev,
 * preview without secrets), it logs and returns { ok: false, skipped: true }
 * — never throws. Callers should not block their main flow on the result.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const client = getClient();
  if (!client) {
    console.info("[email] skipped (no RESEND_API_KEY):", opts.subject, "→", opts.to);
    return { ok: false, skipped: true };
  }

  try {
    const res = await client.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text
    });
    if (res.error) {
      console.warn("[email] send failed:", res.error.message);
      return { ok: false, error: res.error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.warn("[email] threw:", message);
    return { ok: false, error: message };
  }
}

export function welcomeEmail(name: string, email: string) {
  const greeting = name?.trim() ? `Hi ${name.trim().split(/\s+/)[0]},` : "Hi,";
  const dashboardUrl = `${APP_URL}/dashboard`;

  const text = `${greeting}

Welcome to HireReady — your AI job application suite.

Quick wins to try first:
1. Build a resume in the 6-step builder: ${dashboardUrl}/resume/new
2. Tailor it to a specific job posting (paste a URL — we'll fetch the JD)
3. Score it against the ATS
4. Generate a cover letter in one click

You're on the free plan: 2 resumes, 3 ATS checks/day, 1 cover letter — enough to send out a few sharp applications today.

Open the dashboard: ${dashboardUrl}

— The HireReady team`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;font-family:system-ui,sans-serif;background:#f7f7f9;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:28px;">
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;">Welcome to <span style="color:#6366f1">Hire</span>Ready</h1>
    <p style="margin:0 0 12px;color:#475569;">${greeting}</p>
    <p style="margin:0 0 18px;color:#475569;">You're in. Here's how to get a strong application out the door today:</p>
    <ol style="margin:0 0 18px;padding-left:18px;color:#475569;line-height:1.55;">
      <li>Build a resume in the 6-step builder.</li>
      <li>Paste a job URL — we'll auto-fetch the description.</li>
      <li>Score it against the ATS and fix what's weak.</li>
      <li>Generate a tailored cover letter in one click.</li>
    </ol>
    <p style="margin:0 0 18px;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:500;">
        Open my dashboard →
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#94a3b8;">Free plan: 2 resumes · 3 ATS checks/day · 1 cover letter.</p>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:16px;">Sent to ${email}</p>
</body></html>`;

  return { subject: "Welcome to HireReady", html, text };
}
