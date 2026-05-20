import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountSettings } from "@/lib/account-data-server";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { DefaultsSection } from "@/components/settings/DefaultsSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { UsageSection } from "@/components/settings/UsageSection";
import { NotificationsSection } from "@/components/settings/NotificationsSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { ExportSection } from "@/components/settings/ExportSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";

export const metadata = {
  title: "Settings · HireReady"
};

export default async function SettingsPage() {
  const settings = await getAccountSettings();
  if (!settings) redirect("/login");

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-text-muted">Account</span>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1>
            <p className="text-sm text-text-muted">Profile, plan, defaults, and account controls.</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-input border border-border bg-card px-3 py-2 text-xs text-text-muted hover:border-accent hover:text-accent"
          >
            ← Back to dashboard
          </Link>
        </header>

        <ProfileSection initial={settings.profile} />
        <DefaultsSection initial={settings.defaults} />
        <BillingSection
          plan={settings.plan}
          plan_expires_at={settings.plan_expires_at}
          has_stripe_customer={Boolean(settings.stripe_customer_id)}
        />
        {settings.plan === "free" && (
          <UsageSection usage={settings.usage} limits={settings.limits} />
        )}
        <NotificationsSection initial={settings.notifications} />
        <PasswordSection />
        <ExportSection />
        <AppearanceSection />
      </div>
    </div>
  );
}
