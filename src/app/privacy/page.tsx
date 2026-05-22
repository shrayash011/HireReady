import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy · HireReady",
  description: "How HireReady collects, uses, and protects your personal information."
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="May 21, 2026">
      <h2>1. Introduction</h2>
      <p>
        HireReady Pvt Ltd is committed to protecting your personal information. This Privacy Policy
        explains what data we collect, how we use it, and your rights regarding it.
      </p>
      <p>
        By using HireReady, you agree to the collection and use of information as described in this policy.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Information You Provide</h3>
      <ul>
        <li><strong>Account information:</strong> Name, email address, password</li>
        <li><strong>Profile information:</strong> Current job title, location, LinkedIn URL, portfolio URL</li>
        <li><strong>Resume content:</strong> Work history, education, skills, languages, certifications</li>
        <li><strong>Job application data:</strong> Company names, job descriptions, application status</li>
        <li>
          <strong>Payment information:</strong> We do NOT store payment card details. Payments are processed
          by Paddle or PayPal who have their own privacy policies.
        </li>
        <li>
          <strong>Voice recordings:</strong> If you use voice mock interviews, audio is recorded, transcribed,
          and then deleted within 24 hours. Only the text transcript is retained.
        </li>
        <li><strong>Communications:</strong> Emails or messages you send to our support team</li>
      </ul>

      <h3>2.2 Information Collected Automatically</h3>
      <ul>
        <li><strong>Usage data:</strong> Pages visited, features used, time spent, clicks</li>
        <li><strong>Device information:</strong> Browser type, operating system, IP address</li>
        <li><strong>Cookies:</strong> Session cookies (required for login) and analytics cookies (optional)</li>
        <li><strong>Log data:</strong> Server logs including access times and errors</li>
      </ul>

      <h3>2.3 Information from Third Parties</h3>
      <ul>
        <li>If you connect LinkedIn (Premium plan), we receive your public profile data with your permission</li>
        <li>If you sign in with Google, we receive your name and email</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <table>
        <thead>
          <tr><th>Purpose</th><th>Legal Basis</th></tr>
        </thead>
        <tbody>
          <tr><td>Provide and improve the Service</td><td>Contract performance</td></tr>
          <tr><td>Generate AI-powered resume, cover letter, and interview content</td><td>Contract performance</td></tr>
          <tr><td>Process payments and manage subscriptions</td><td>Contract performance</td></tr>
          <tr><td>Send transactional emails (receipts, account alerts)</td><td>Contract performance</td></tr>
          <tr><td>Send product update emails</td><td>Legitimate interest (opt-out available)</td></tr>
          <tr><td>Analyze usage to improve features</td><td>Legitimate interest</td></tr>
          <tr><td>Prevent fraud and abuse</td><td>Legitimate interest</td></tr>
          <tr><td>Comply with legal obligations</td><td>Legal obligation</td></tr>
        </tbody>
      </table>

      <p>We do NOT:</p>
      <ul>
        <li>Sell your personal data to third parties</li>
        <li>Use your resume content to train AI models without explicit consent</li>
        <li>Share your data with employers or recruiters without your permission</li>
        <li>Use your data for advertising purposes</li>
      </ul>

      <h2>4. AI and Your Data</h2>
      <p>
        HireReady uses the Anthropic Claude API to generate resume content, ATS scores, cover letters,
        and interview feedback.
      </p>
      <ul>
        <li>Your resume and job description content is sent to Anthropic&apos;s API to generate outputs</li>
        <li>Anthropic&apos;s API does not use your data to train their models (as per their API data privacy terms)</li>
        <li>We do not permanently store the raw prompts sent to the AI — only the generated outputs you save</li>
        <li>Voice recordings for mock interviews are sent to OpenAI&apos;s Whisper API for transcription only, then deleted within 24 hours</li>
      </ul>

      <h2>5. Data Sharing</h2>
      <p>We share your data only in these limited circumstances:</p>
      <table>
        <thead>
          <tr><th>Recipient</th><th>What We Share</th><th>Why</th></tr>
        </thead>
        <tbody>
          <tr><td>Anthropic (Claude API)</td><td>Resume content, job descriptions</td><td>To generate AI outputs</td></tr>
          <tr><td>OpenAI (Whisper API)</td><td>Voice recordings</td><td>To transcribe mock interview answers</td></tr>
          <tr><td>Paddle / PayPal</td><td>Name, email, purchase amount</td><td>To process payments</td></tr>
          <tr><td>Supabase</td><td>All account and app data</td><td>Our database provider</td></tr>
          <tr><td>Vercel</td><td>Request metadata</td><td>Our hosting provider</td></tr>
          <tr><td>Law enforcement</td><td>Data as required</td><td>Legal compliance only</td></tr>
        </tbody>
      </table>
      <p>We do not share your data with any other third parties. We do not sell data. Ever.</p>

      <h2>6. Data Retention</h2>
      <table>
        <thead>
          <tr><th>Data Type</th><th>Retention Period</th></tr>
        </thead>
        <tbody>
          <tr><td>Account data</td><td>Until you delete your account + 30 days</td></tr>
          <tr><td>Resume and application data</td><td>Until you delete it or your account</td></tr>
          <tr><td>Voice recordings</td><td>24 hours maximum</td></tr>
          <tr><td>Payment records</td><td>7 years (legal requirement)</td></tr>
          <tr><td>Usage/analytics logs</td><td>12 months</td></tr>
          <tr><td>Support emails</td><td>2 years</td></tr>
        </tbody>
      </table>
      <p>
        When you delete your account, we delete all your personal data within 30 days, except payment
        records which we must retain for legal compliance.
      </p>

      <h2>7. Cookies</h2>
      <p>We use the following cookies:</p>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Type</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr><td>session</td><td>Required</td><td>Keeps you logged in</td></tr>
          <tr><td>supabase-auth</td><td>Required</td><td>Authentication token</td></tr>
          <tr><td>analytics</td><td>Optional</td><td>Usage analytics (you can opt out)</td></tr>
        </tbody>
      </table>
      <p>
        You can disable optional cookies in Settings → Privacy. Disabling required cookies will prevent
        you from logging in.
      </p>

      <h2>8. Data Security</h2>
      <p>We protect your data using:</p>
      <ul>
        <li>HTTPS encryption for all data in transit</li>
        <li>AES-256 encryption for sensitive data at rest</li>
        <li>Supabase Row Level Security (RLS) ensuring you can only access your own data</li>
        <li>Regular security audits</li>
        <li>Strict access controls — only essential team members can access production data</li>
      </ul>
      <p>
        Despite our best efforts, no system is 100% secure. If we experience a data breach affecting
        your data, we will notify you within 72 hours.
      </p>

      <h2>9. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
        <li><strong>Correction:</strong> Request we correct inaccurate data</li>
        <li><strong>Deletion:</strong> Request we delete your data (&quot;right to be forgotten&quot;)</li>
        <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
        <li><strong>Objection:</strong> Object to certain processing of your data</li>
        <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
      </ul>
      <p>
        <strong>To exercise any of these rights</strong>, email us at{" "}
        <a href="mailto:hireready011@gmail.com">hireready011@gmail.com</a> with the subject &quot;Data Rights Request&quot;.
        We will respond within 30 days.
      </p>
      <p>
        You can also delete your account and all associated data directly from{" "}
        <strong>Settings → Account → Delete Account</strong>.
      </p>

      <h2>10. Children&apos;s Privacy</h2>
      <p>
        HireReady is not intended for users under 16 years of age. We do not knowingly collect personal
        information from children under 16. If we become aware that we have collected data from a child
        under 16, we will delete it immediately.
      </p>

      <h2>11. International Data Transfers</h2>
      <p>
        HireReady is operated from Nepal. Your data may be stored and processed in the United States
        (Supabase, Vercel, Anthropic servers) and other countries. By using the Service, you consent to
        this transfer.
      </p>
      <p>We ensure all third-party providers maintain appropriate data protection standards.</p>

      <h2>12. GDPR (EU Users)</h2>
      <p>If you are in the European Union or UK, you have additional rights under GDPR:</p>
      <ul>
        <li>Right to lodge a complaint with your local data protection authority</li>
        <li>Right to restrict processing</li>
        <li>Legal basis for all processing is described in Section 3</li>
      </ul>
      <p>
        Our Data Protection contact:{" "}
        <a href="mailto:hireready011@gmail.com">hireready011@gmail.com</a>
      </p>

      <h2>13. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you by email and in-app notice
        at least 14 days before material changes take effect. The &quot;Last updated&quot; date at the top reflects
        the most recent revision.
      </p>

      <h2>14. Contact</h2>
      <p>For privacy questions or data requests:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:hireready011@gmail.com">hireready011@gmail.com</a></li>
        <li><strong>Address:</strong> Sitapaila, Kathmandu, Nepal</li>
        <li><strong>Response time:</strong> Within 30 days</li>
      </ul>
    </LegalPage>
  );
}
