import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        card:    "rgb(var(--color-card) / <alpha-value>)",
        border:  "rgb(var(--color-border) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          hover:   "rgb(var(--color-accent-hover) / <alpha-value>)"
        },
        good: "rgb(var(--color-good) / <alpha-value>)",
        warn: "rgb(var(--color-warn) / <alpha-value>)",
        bad:  "rgb(var(--color-bad) / <alpha-value>)",
        text: {
          DEFAULT: "rgb(var(--color-text) / <alpha-value>)",
          muted:   "rgb(var(--color-text-muted) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        card: "14px",
        input: "10px",
        pill: "99px"
      },
      boxShadow: {
        soft: "0 1px 2px rgb(15 23 42 / 0.04), 0 4px 12px rgb(15 23 42 / 0.04)",
        lift: "0 4px 16px rgb(15 23 42 / 0.08), 0 12px 32px rgb(15 23 42 / 0.06)",
        glow: "0 0 0 3px rgb(99 102 241 / 0.25)"
      },
      keyframes: {
        "fade-in":   { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "scale-in":  { "0%": { opacity: "0", transform: "scale(0.96)" },     "100%": { opacity: "1", transform: "scale(1)" } },
        "shimmer":   { "0%": { backgroundPosition: "200% 0" },                "100%": { backgroundPosition: "-200% 0" } }
      },
      animation: {
        "fade-in":  "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        "shimmer":  "shimmer 2.5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
