import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        brand: {
          50: "#f0f0ff",
          100: "#e0dffe",
          200: "#c4bffd",
          300: "#a595fc",
          400: "#8b6bf9",
          500: "#7c4dff",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b0764",
          950: "#1e0040",
        },
        surface: {
          DEFAULT: "#0a0a0f",
          50: "#18182a",
          100: "#1e1e32",
          200: "#252540",
          300: "#2d2d4a",
          400: "#383860",
        },
        accent: {
          purple: "#a855f7",
          blue: "#3b82f6",
          cyan: "#06b6d4",
          pink: "#ec4899",
          emerald: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 60, 220, 0.3), transparent)",
        "card-glow":
          "radial-gradient(ellipse at center, rgba(120, 60, 220, 0.08), transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(124, 77, 255, 0.15)",
        "glow-lg": "0 0 40px rgba(124, 77, 255, 0.2)",
        "glow-accent": "0 0 30px rgba(168, 85, 247, 0.25)",
        card: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
        "card-hover":
          "0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 77, 255, 0.1)",
        neon: "inset 0 0 20px rgba(124, 77, 255, 0.05), 0 0 20px rgba(124, 77, 255, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", filter: "blur(8px)" },
          "100%": { opacity: "1", filter: "blur(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
