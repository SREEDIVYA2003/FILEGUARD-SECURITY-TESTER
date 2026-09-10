import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        foreground: "#f1f5f9",
        card: {
          DEFAULT: "#0f172a",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "#0f172a",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#06b6d4",
          foreground: "#080c14",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#1e293b",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#38bdf8",
          foreground: "#080c14",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#1e293b",
        input: "#1e293b",
        ring: "#06b6d4",
        cyber: {
          900: "#060913",
          800: "#0b1220",
          700: "#131d31",
          600: "#1e293b",
          cyan: "#00f2fe",
          blue: "#4facfe",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          purple: "#a855f7",
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.2), inset 0 0 5px rgba(6, 182, 212, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(6, 182, 212, 0.3)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
