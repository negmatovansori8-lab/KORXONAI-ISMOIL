import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        oil: {
          950: "#07090c",
          900: "#0b1016",
          850: "#10161e",
          800: "#151d27",
          700: "#1c2733",
          600: "#243140",
        },
        gold: {
          300: "#f3d48a",
          400: "#e2b84a",
          500: "#c9972a",
        },
        tajik: {
          red: "#c8102e",
          green: "#1a7f4c",
        },
        teal: {
          400: "#2ee6c7",
          500: "#14b8a6",
        },
      },
      boxShadow: {
        card: "0 18px 50px rgba(0,0,0,.45)",
        glow: "0 0 40px rgba(226,184,74,.12)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
