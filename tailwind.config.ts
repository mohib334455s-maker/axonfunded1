import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050506",
        "background-deep": "#040405",
        elevated: "#15151f",
        "midnight-blue": "#050a14",
        "midnight-blue-light": "#0d1a2e",
        surface: "rgba(255,255,255,0.04)",
        "surface-2": "rgba(255,255,255,0.035)",
        silver: {
          DEFAULT: "#C0C0C0",
          light: "#E8E8E8",
          dark: "#A8A8A8",
        },
        gold: {
          DEFAULT: "#FFD700",
          50: "#FFFDE7",
          100: "#FFF9C4",
          200: "#FFF176",
          300: "#FFE740",
          400: "#FFD700",
          500: "#FFD700",
          600: "#DAA520",
          700: "#B8860B",
          800: "#996515",
          900: "#7A4F0D",
        },
        success: "#00C853",
        danger: "#FF1744",
        warning: "#FFC107",
        info: "#00B8D4",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        "1": "0.25rem",
        "2": "0.5rem",
        "3": "0.75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "8": "2rem",
        "10": "2.5rem",
        "12": "3rem",
        "16": "4rem",
        "20": "5rem",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FFD700 0%, #DAA520 100%)",
        "dark-gradient": "linear-gradient(180deg, #0A0A0A 0%, #111111 100%)",
        "hero-gradient": "linear-gradient(180deg, #050506 0%, #050506 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,215,0,0.05) 0%, transparent 100%)",
      },
      boxShadow: {
        gold: "0 0 20px rgba(255,215,0,0.15), 0 0 40px rgba(255,215,0,0.05)",
        "gold-lg":
          "0 0 40px rgba(255,215,0,0.2), 0 0 80px rgba(255,215,0,0.1)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6)",
      },
      borderColor: {
        "gold-30": "rgba(255,215,0,0.3)",
        "gold-50": "rgba(255,215,0,0.5)",
        "white-10": "rgba(255,255,255,0.1)",
        "white-5": "rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 2s infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,215,0,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(255,215,0,0.3)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
