import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Barlow Condensed", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        acid: {
          DEFAULT: "#CCFF00",
          50: "#F5FFB3",
          100: "#EEFF80",
          200: "#DDFF33",
          300: "#CCFF00",
          400: "#A8D600",
          500: "#8AB300",
        },
        surface: {
          DEFAULT: "#080808",
          50: "#0A0A0A",
          100: "#0C0C0C",
          200: "#111111",
          300: "#181818",
          400: "#222222",
        },
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
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
