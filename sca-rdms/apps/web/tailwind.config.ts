import type { Config } from "tailwindcss";

// Color tokens sourced from 2026-08-07-sca-ui-design-plan.md, section 2.
// CSS variables are defined per-theme in app/globals.css; Tailwind just
// references them here so `bg-primary`, `text-muted-foreground`, etc. work
// and automatically flip with the `.dark` class.
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "var(--color-primary)", foreground: "var(--color-primary-foreground)", soft: "var(--color-primary-soft)" },
        secondary: { DEFAULT: "var(--color-secondary)", foreground: "var(--color-secondary-foreground)" },
        background: "var(--color-background)",
        surface: { DEFAULT: "var(--color-surface)", muted: "var(--color-surface-muted)" },
        border: "var(--color-border)",
        foreground: "var(--color-foreground)",
        "muted-foreground": "var(--color-muted-foreground)",
        success: { DEFAULT: "var(--color-success)", soft: "var(--color-success-soft)" },
        warning: { DEFAULT: "var(--color-warning)", soft: "var(--color-warning-soft)" },
        destructive: { DEFAULT: "var(--color-destructive)", soft: "var(--color-destructive-soft)" },
        info: { DEFAULT: "var(--color-info)", soft: "var(--color-info-soft)" },
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
        lg: "16px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
