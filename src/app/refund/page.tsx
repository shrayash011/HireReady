import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Refund Policy · HireReady",
  description: "HireReady refund and cancellation terms."
};

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" effectiveDate="May 21, 2026">
      <h2>Our Commitment</h2>
      <p>
        We want you to be completely satisfied with HireReady. If you&apos;re not happy with your purchase,
        we&apos;ll do our best to make it right.
      </p>

      <h2>1. Subscription Refunds</h2>

      <h3>Monthly Plans (Pro $9/mo · Premium $29/mo)</h3>
      <table>
        <thead>
          <tr><th>Situation</th><th>Refund</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Within 3 days of your first payment</td>
            <td>Full refund — no questions asked</td>
          </tr>
          <tr>
            <td>After 3 days</td>
            <td>No refund — access continues until end of billing period</td>
          </tr>
          <tr>
            <td>Renewal charges</td>
            <td>No refund — cancel before renewal to avoid future charges</td>
          </tr>
        </tbody>
      </table>

      <h3>Annual Plans (Pro · Premium)</h3>
      <table>
        <thead>
          <tr><th>Situation</th><th>Refund</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Within 14 days of purchase</td>
            <td>Full refund — no questions asked</td>
          </tr>
          <tr>
            <td>After 14 days</td>
            <td>No refund — access continues until end of annual period</td>
          </tr>
        </tbody>
      </table>

      <h3>Why These Limits?</h3>
      <p>
        We provide immediate access to all features upon payment. AI credits are consumed the moment you
        generate resumes, ATS scores, and cover letters. Our refund window is designed to give you enough
        time to evaluate the product while protecting against abuse.
      </p>

      <h2>2. One-Time Credit Purchases</h2>
      <table>
        <thead>
          <tr><th>Situation</th><th>Refund</th></tr>
        </thead>
        <tbody>
          <tr><td>Credits not yet used</td><td>Full refund within 7 days</td></tr>
          <tr><td>Credits partially used</td><td>Prorated refund for unused credits within 7 days</td></tr>
          <tr><td>Credits fully used</td><td>No refund</td></tr>
        </tbody>
      </table>

      <h2>3. Exceptions — We Will Always Refund</h2>
      <p>Regardless of the time elapsed, we will issue a full refund if:</p>
      <ul>
        <li>You were charged twice for the same subscription (duplicate charge)</li>
        <li>You were charged after cancelling your subscription</li>
        <li>A technical error on our end prevented you from accessing the Service for more than 48 consecutive hours</li>
        <li>You were charged the wrong amount due to a pricing error on our part</li>
      </ul>

      <h2>4. Exceptions — We Will Not Refund</h2>
      <p>We do not issue refunds if:</p>
      <ul>
        <li>You forgot to cancel before a renewal date</li>
        <li>You did not use the Service during your subscription period</li>
        <li>You did not get a job interview or job offer (outcomes are not guaranteed)</li>
        <li>You changed your mind after the refund window</li>
        <li>Your account was terminated for violating our Terms of Service</li>
      </ul>

      <h2>5. How to Request a Refund</h2>
      <p>
        <strong>Step 1:</strong> Email us at <a href="mailto:hireready011@gmail.com">hireready011@gmail.com</a>
        <br />
        <strong>Subject line:</strong> Refund Request — [your account email]
        <br />
        <strong>Include:</strong>
      </p>
      <ul>
        <li>Your account email address</li>
        <li>The date of purchase</li>
        <li>The plan or product purchased</li>
        <li>Reason for the refund request (optional but helpful)</li>
      </ul>
      <p>
        <strong>Step 2:</strong> We will review your request and respond within{" "}
        <strong>2 business days</strong>.
      </p>
      <p>
        <strong>Step 3:</strong> If approved, the refund will be processed within{" "}
        <strong>5–10 business days</strong> back to your original payment method (Paddle or PayPal
        processing times apply).
      </p>

      <h2>6. Cancellation vs. Refund</h2>
      <p>
        <strong>Cancellation</strong> stops future charges but does not trigger a refund. You keep access
        to your paid features until the end of your current billing period.
      </p>
      <p>
        <strong>Refund</strong> reverses a charge already made. Approving a refund also cancels your
        subscription immediately.
      </p>
      <p>
        To cancel your subscription without a refund: go to <strong>Settings → Billing → Manage billing</strong>.
      </p>

      <h2>7. Free Plan</h2>
      <p>
        The Free plan costs nothing. There is nothing to refund. If you have concerns about the Free plan,
        please contact our support team.
      </p>

      <h2>8. Chargebacks</h2>
      <p>
        We strongly encourage you to contact us before initiating a chargeback with your bank or payment
        provider. Chargebacks are costly for small businesses and often take weeks to resolve.
      </p>
      <p>
        If you have a valid concern, we will resolve it quickly and fairly. Accounts with unresolved
        chargebacks may be suspended pending resolution.
      </p>

      <h2>9. Contact</h2>
      <p>For refund requests or billing questions:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:hireready011@gmail.com">hireready011@gmail.com</a></li>
        <li><strong>Response time:</strong> Within 2 business days</li>
        <li><strong>Refund processing:</strong> 5–10 business days after approval</li>
      </ul>
    </LegalPage>
  );
}
