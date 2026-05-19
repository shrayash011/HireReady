import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { UpgradePromptModal } from "@/components/ui/UpgradePromptModal";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "HireReady — AI Resume, ATS, Cover Letters & Mock Interviews",
  description:
    "The complete AI-powered job application toolkit. Build ATS-safe resumes, score them, generate cover letters, and ace mock interviews.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
};

// Runs before React hydrates — reads the saved theme and applies the .dark class
// so there's no flash of the wrong theme on page load. Default is light.
const themeInitScript = `
(function(){try{
  var t = localStorage.getItem('hireready-theme');
  if (t === 'dark') document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        {children}
        <UpgradePromptModal />
      </body>
    </html>
  );
}
