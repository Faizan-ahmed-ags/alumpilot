import type { Config } from "tailwindcss";

/**
 * AlumniBridge Design System (docs/04-design-system.md)
 * Palette: #F7F8FA canvas, #111827 ink, #344054 ink-soft, #4F46E5 brand,
 * #16A34A success, #D97706 warning, #DC2626 danger, #E4E7EC border, #FFFFFF card.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F8FA",
        card: "#FFFFFF",
        ink: {
          DEFAULT: "#111827",
          soft: "#344054",
          mute: "#667085",
          faint: "#98A2B3",
        },
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          DEFAULT: "#4F46E5",
        },
        success: {
          DEFAULT: "#16A34A",
          soft: "#F0FDF4",
        },
        warning: {
          DEFAULT: "#D97706",
          soft: "#FFFBEB",
        },
        danger: {
          DEFAULT: "#DC2626",
          soft: "#FEF2F2",
        },
        info: {
          DEFAULT: "#2563EB",
          soft: "#EFF6FF",
        },
        line: {
          DEFAULT: "#E4E7EC",
          strong: "#D0D5DD",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xl": ["24px", "32px"],
        "3xl": ["30px", "38px"],
        "4xl": ["38px", "46px"],
        "5xl": ["48px", "56px"],
        hero: ["40px", "48px"],
      },
      borderRadius: {
        card: "16px",
        cardSm: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.05)",
        cardHover: "0 4px 12px rgba(16,24,40,0.08)",
        pop: "0 8px 28px rgba(16,24,40,0.14)",
        modal: "0 24px 64px rgba(16,24,40,0.18)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "scale-in": "scale-in 0.2s ease-out both",
        "slide-in-right": "slide-in-right 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;