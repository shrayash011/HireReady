# HireReady — Claude Code Project Brief

## What this product is
HireReady is an AI-powered job application suite. Users get a complete toolkit:
resume building + ATS scoring + cover letter generation + mock interview coaching — all in one app.

**Target users:** Job seekers globally — with a focus on South Asia, Middle East, Africa, and international candidates
**Core pain:** 75% of resumes are rejected by ATS before a human sees them. No single tool does resume + ATS + cover letter + interview prep well together.
**Unique angle:** The only app that combines all 4 tools + voice mock interviews + global CV formats in one seamless flow.

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Framework | Next.js 14 (App Router) | TypeScript strict, src/ directory |
| Styling | Tailwind CSS | Dark theme, indigo #6366F1 accent |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage (PDF files) |
| AI — Text | Anthropic Claude API | claude-sonnet-4-20250514 |
| AI — Voice | OpenAI Whisper API | Speech-to-text for mock interviews |
| PDF Export | React-PDF or Puppeteer | ATS-safe PDF generation |
| Payments | Stripe | Subscriptions + webhook |
| Deployment | Vercel | Auto-deploy from GitHub |
| Email | Resend | Transactional + weekly job digest |

---

## Project Structure

```
hireready/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx          ← Main hub
│   │   │   ├── dashboard/resume/
│   │   │   │   ├── new/page.tsx            ← Resume builder (6 steps)
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── dashboard/interview/page.tsx ← Mock interview
│   │   │   ├── dashboard/tracker/page.tsx   ← Job Kanban board
│   │   │   └── settings/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── api/
│   │   │   ├── resume/
│   │   │   │   ├── generate/route.ts       ← AI resume writing
│   │   │   │   ├── tailor/route.ts         ← Tailor resume to JD
│   │   │   │   ├── ats-score/route.ts      ← ATS analysis
│   │   │   │   └── export-pdf/route.ts     ← PDF generation
│   │   │   ├── cover-letter/
│   │   │   │   └── generate/route.ts
│   │   │   ├── interview/
│   │   │   │   ├── questions/route.ts      ← Generate questions
│   │   │   │   ├── feedback/route.ts       ← Score answers
│   │   │   │   └── transcribe/route.ts     ← Whisper voice→text
│   │   │   ├── jobs/
│   │   │   │   └── parse/route.ts          ← Scrape job URL
│   │   │   └── billing/
│   │   │       ├── subscribe/route.ts
│   │   │       └── webhook/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx                        ← Landing page
│   ├── components/
│   │   ├── resume/
│   │   │   ├── ResumeBuilder.tsx           ← Multi-step form
│   │   │   ├── ATSScorePanel.tsx           ← Live score sidebar
│   │   │   ├── ResumePreview.tsx           ← Live preview
│   │   │   └── templates/
│   │   │       ├── CleanTemplate.tsx
│   │   │       ├── ModernTemplate.tsx
│   │   │       └── ExecutiveTemplate.tsx
│   │   ├── interview/
│   │   │   ├── InterviewSession.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── FeedbackCard.tsx
│   │   ├── dashboard/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── ResumeCard.tsx
│   │   │   └── StatsRow.tsx
│   │   └── ui/
│   │       ├── PaywallModal.tsx
│   │       ├── PricingTable.tsx
│   │       └── UpgradePrompt.tsx
│   ├── lib/
│   │   ├── supabase.ts                     ← server + browser clients
│   │   ├── anthropic.ts                    ← Claude API wrapper
│   │   ├── whisper.ts                      ← Whisper voice transcription
│   │   ├── prompts.ts                      ← ALL AI prompt builders
│   │   ├── pdf.ts                          ← PDF export logic
│   │   └── stripe.ts
│   ├── db/
│   │   └── schema.sql
│   └── types/
│       └── index.ts
├── CLAUDE.md                               ← This file
├── .env.local
└── .gitignore
```

---

## Database Schema

### users
```sql
id uuid PK | email text UNIQUE | full_name text | avatar_url text
plan text ('free'|'pro'|'premium') DEFAULT 'free'
plan_expires_at timestamptz | stripe_customer_id text | created_at | updated_at
```

### resumes
```sql
id uuid PK | user_id uuid FK | title text | template text ('clean'|'modern'|'executive')
content_json jsonb  -- {personal_info, experiences[], education[], skills[], languages[]}
last_ats_score int | target_role text | created_at | updated_at
```

### job_applications
```sql
id uuid PK | user_id uuid FK | resume_id uuid FK
company text | role text | job_url text | job_description text
status text ('saved'|'applied'|'phone_screen'|'interview'|'offer'|'rejected')
applied_at timestamptz | notes text | created_at | updated_at
```

### ats_scores
```sql
id uuid PK | resume_id uuid FK | job_application_id uuid FK
score int (0-100) | feedback_json jsonb
  -- {missing_keywords[], weak_bullets[], suggestions[], strengths[], keyword_matches[]}
created_at timestamptz
```

### cover_letters
```sql
id uuid PK | user_id uuid FK | resume_id uuid FK | job_application_id uuid FK
content text | tone text ('professional'|'enthusiastic'|'concise') | created_at
```

### mock_interviews
```sql
id uuid PK | user_id uuid FK | role text | experience_level text | company text
interview_type text ('behavioral'|'technical'|'mixed')
questions_json jsonb -- [{question, type, difficulty}]
answers_json jsonb  -- [{question_id, answer_text, audio_url}]
scores_json jsonb   -- [{question_id, score, feedback, star_rating, model_answer}]
overall_score int | completed_at timestamptz | created_at
```

### daily_usage
```sql
id uuid PK | user_id uuid FK | usage_date date DEFAULT today
resumes_created int DEFAULT 0 | ats_checks int DEFAULT 0
cover_letters_created int DEFAULT 0 | interviews_started int DEFAULT 0
UNIQUE(user_id, usage_date)
```

---

## Plan Limits & Enforcement

| Feature | Free | Pro ($9/mo) | Premium ($29/mo) |
|---------|------|-------------|-----------------|
| Resumes | 2 total | Unlimited | Unlimited |
| ATS Scores | 3/day | Unlimited | Unlimited |
| Cover Letters | 1 total | Unlimited | Unlimited |
| PDF Export | Watermarked | Clean | Clean |
| Mock Interviews | — | Text only | Text + Voice |
| Job Tracker | 5 jobs | Unlimited | Unlimited |
| LinkedIn Import | — | — | ✓ |
| Voice Interviews | — | — | ✓ |

**Enforce limits in EVERY API route:**
```typescript
const FREE_LIMITS = { resumes: 2, ats_checks: 3, cover_letters: 1, interviews: 0 };

async function checkLimit(userId: string, feature: keyof typeof FREE_LIMITS) {
  const user = await getUser(userId);
  if (user.plan !== 'free') return; // paid users: no limits
  const usage = await getDailyUsage(userId);
  if ((usage[feature] ?? 0) >= FREE_LIMITS[feature]) {
    throw new PaywallError(`${feature}_limit_reached`);
  }
}
```

---

## AI Prompt Functions (in src/lib/prompts.ts)

### 1. Resume Tailoring
```typescript
export function buildResumeTailorPrompt(resume: Resume, jobDescription: string): string {
  return `You are an expert resume writer and career coach with 15 years of experience.

Rewrite the following resume to be perfectly tailored for this job description.

Job Description:
${jobDescription}

Current Resume:
${JSON.stringify(resume.content_json)}

Rules:
1. Mirror keywords from the job description naturally (don't keyword-stuff)
2. Rewrite bullet points using strong action verbs + quantified results (STAR format)
3. Prioritize experiences most relevant to this role
4. Keep it to 1 page for <5 years experience, 2 pages max for senior roles
5. Every bullet must start with a past-tense action verb
6. Add metrics wherever possible ("increased sales by 40%", "managed team of 8")

Return ONLY valid JSON in the same format as the input content_json. No explanation.`;
}
```

### 2. ATS Scoring
```typescript
export function buildATSPrompt(resumeText: string, jobDescription: string): string {
  return `You are an ATS (Applicant Tracking System) expert.

Analyze this resume against the job description and return a detailed ATS compatibility report.

Job Description: ${jobDescription}
Resume: ${resumeText}

Return ONLY this JSON structure:
{
  "score": <0-100>,
  "keyword_matches": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "weak_bullets": [{"original": "...", "issue": "...", "improved": "..."}],
  "suggestions": ["specific actionable fix 1", "specific actionable fix 2"],
  "strengths": ["what's working well 1", "what's working well 2"],
  "summary": "2-sentence overall assessment"
}`;
}
```

### 3. Cover Letter
```typescript
export function buildCoverLetterPrompt(resume: Resume, jd: string, company: string): string {
  return `Write a compelling, personalized cover letter for this application.

Candidate Background: ${JSON.stringify(resume.content_json.personal_info)} 
Key Experiences: ${resume.content_json.experiences.slice(0,2).map(e => e.bullets.join(', ')).join(' | ')}
Company: ${company}
Job Description: ${jd}

Rules:
1. Opening hook — specific to the company, not generic "I am writing to apply..."
2. Paragraph 2 — strongest relevant achievement with metrics
3. Paragraph 3 — why THIS company specifically (research the culture/mission from JD)
4. Closing — confident, specific next step
5. Total length: 3-4 paragraphs, under 350 words
6. Tone: professional but human — not robotic
7. NO clichés: "passionate", "team player", "hard worker", "go-getter"

Return ONLY the cover letter text. No subject line, no headers.`;
}
```

### 4. Interview Feedback
```typescript
export function buildInterviewFeedbackPrompt(question: string, answer: string, role: string): string {
  return `You are a senior hiring manager and interview coach.

Role: ${role}
Question: ${question}
Candidate's Answer: ${answer}

Evaluate this answer and return ONLY this JSON:
{
  "score": <1-10>,
  "star_rating": <did they use Situation-Task-Action-Result? "full"|"partial"|"none">,
  "strengths": ["what they did well"],
  "improvements": ["specific things to add or change"],
  "missing_elements": ["what a strong answer would include"],
  "model_answer": "A 3-4 sentence example of an excellent answer to this question",
  "one_tip": "The single most impactful thing they can improve"
}`;
}
```

---

## Design System

```css
/* Colors */
--bg: #0D0D0F           /* page background */
--surface: #141416       /* card background */
--card: #1A1A1E          /* elevated card */
--border: #2A2A30
--accent: #6366F1        /* indigo — primary CTA */
--accent-hover: #4F46E5
--green: #22C55E         /* ATS good score */
--amber: #F59E0B         /* ATS medium score */
--red: #EF4444           /* ATS poor score */
--text: #F0EDE8
--text-muted: #888890

/* ATS Score Colors */
0–49:   red    (#EF4444)
50–74:  amber  (#F59E0B)
75–89:  green  (#22C55E)
90–100: indigo (#6366F1) — exceptional

/* Font */
DM Sans (Google Fonts) — weights 400, 500, 600, 700

/* Border Radius */
Cards: 14–16px | Inputs: 10px | Buttons: 10px | Pills: 99px
```

---

## Environment Variables

```bash
# Anthropic
ANTHROPIC_API_KEY=

# OpenAI (Whisper for voice interviews)
OPENAI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PREMIUM_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
STRIPE_PREMIUM_YEARLY_PRICE_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Coding Standards

- **TypeScript**: strict mode, no `any`. Proper types for all DB tables and API responses.
- **Error handling**: Every API route needs try/catch. Return `{ data, error }` shape.
- **Paywall**: Check plan limits FIRST in every API route before any AI call.
- **Loading states**: Every async action needs a loading state in the UI.
- **Mobile-first**: All components work at 375px viewport.
- **No sudo npm**: Never use sudo for npm installs.
- **Supabase**: `createServerClient` in API routes, `createBrowserClient` in components.
- **AI responses**: Always validate and sanitize JSON from Claude before saving to DB.
- **PDF safety**: ATS-safe means: no tables, no columns, no images in resume body, standard fonts only.

---

## Key Business Rules

1. **ATS-safe templates ONLY**: All 3 resume templates must be tested against Workday, Greenhouse, Lever. No columns, no fancy graphics, standard fonts (Arial, Calibri, Georgia).
2. **Free PDF has watermark**: "Created with HireReady · hireready.com" in footer — subtle but visible.
3. **Free tier is generous but limited**: 2 resumes is enough to show value. ATS score limit makes them want to upgrade mid-job-search.
4. **The killer feature is voice interviews**: Phase 3. Don't build until Phase 1–2 users are paying.
5. **Never store raw Whisper audio long-term**: Transcribe, save the text, delete the audio after 24h.
6. **Job URL parsing**: Use a simple HTML fetch + Claude to extract JD content. Don't pay for a third-party scraping API in MVP.

---

## MVP Launch Checklist

- [ ] Supabase schema deployed
- [ ] Auth (signup/login) working
- [ ] Resume builder (6 steps) complete
- [ ] ATS scoring working and accurate
- [ ] Cover letter generator working
- [ ] PDF export — clean + watermarked versions
- [ ] Dashboard with resume cards
- [ ] Free tier limits enforced
- [ ] Stripe payment + webhook working
- [ ] Mobile responsive at 375px
- [ ] Deployed to Vercel

---

## Do NOT build in MVP (Phase 2+)

- Voice mock interviews
- LinkedIn profile importer
- Chrome extension
- Job application Kanban tracker (basic version only)
- Email job digest
- Mobile app
- Auto-apply feature
- Recruiter marketplace

---

## Commands

```bash
npm run dev          # Start dev server :3000
npm run build        # Production build
npx tsc --noEmit    # TypeScript check
vercel --prod        # Deploy to production
```

---

*Stack: Next.js 14 · Supabase · Claude API · Whisper · Stripe · Vercel*
*Target cost at 500 users: ~$95/mo*
*Target time to MVP: 8–10 weeks solo*
*Last updated: May 2026*
