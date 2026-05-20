import { NextResponse } from "next/server";
import { claudeComplete, parseJsonFromModel } from "@/lib/anthropic";
import { buildJobUrlParsePrompt } from "@/lib/prompts";
import { createServerSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  url: string;
}

interface ParsedJob {
  company: string;
  role: string;
  location: string;
  jobDescription: string;
}

// Hard cap on input to Claude — most JD pages clean down well under this.
const MAX_PLAIN_TEXT_CHARS = 18_000;

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user?.id) {
    return NextResponse.json(
      { error: { code: "auth_required", message: "Sign in first." } },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = (body.url ?? "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "A valid http(s) URL is required" }, { status: 400 });
  }

  try {
    // Fetch the page server-side. UA helps with some sites; many job boards still serve HTML to bots.
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; HireReadyBot/1.0; +https://hireready.com/bot)",
        accept: "text/html,application/xhtml+xml"
      }
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not fetch the URL (${res.status}). The site may block scrapers — paste the JD manually.` },
        { status: 400 }
      );
    }

    const html = await res.text();
    const plain = htmlToPlainText(html).slice(0, MAX_PLAIN_TEXT_CHARS);

    if (plain.length < 200) {
      return NextResponse.json(
        { error: "Too little readable content on that page — paste the JD manually." },
        { status: 400 }
      );
    }

    const prompt = buildJobUrlParsePrompt(plain, url);
    const raw = await claudeComplete({ prompt, maxTokens: 2048, temperature: 0.2 });
    const parsed = parseJsonFromModel<ParsedJob>(raw);

    return NextResponse.json({ data: parsed, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

/**
 * Strip scripts/styles/HTML to plain text. Cheap and good enough for JD pages —
 * we lean on Claude to filter out remaining navigation/footer boilerplate.
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|section|article|li|h[1-6]|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
