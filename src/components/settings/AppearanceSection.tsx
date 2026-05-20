import { SectionShell } from "./SectionShell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function AppearanceSection() {
  return (
    <SectionShell title="Appearance" description="Switch between light and dark themes.">
      <div className="flex items-center justify-between gap-4 rounded-input border border-border bg-surface px-4 py-3">
        <div>
          <div className="text-sm font-medium">Theme</div>
          <div className="mt-0.5 text-xs text-text-muted">Stored in your browser.</div>
        </div>
        <ThemeToggle />
      </div>
    </SectionShell>
  );
}
