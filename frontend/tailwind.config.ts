import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#e0ebff",
          200: "#b8d4fe",
          300: "#7ab4fc",
          400: "#3b8ff9",
          500: "#1a6de8",
          600: "#0d53c7",
          700: "#0c43a2",
          800: "#103986",
          900: "#12326f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
