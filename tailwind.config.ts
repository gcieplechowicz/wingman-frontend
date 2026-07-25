import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAFA",
        surface: "#FFFFFF",
        "surface-hover": "#F2F0F6",
        "surface-raised": "#F5F3F8",
        border: "#E6E3ED",
        "text-primary": "#1E1B26",
        "text-muted": "#726C82",
        spark: {
          DEFAULT: "#E8395F",
          dim: "#B3273F",
          glow: "#FF7A93",
        },
        violet: {
          DEFAULT: "#6355E0",
          dim: "#4B3FB0",
        },
        online: "#1F9D77",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        "spark-glow": "0 0 0 1px rgba(232,57,95,0.18), 0 8px 24px -10px rgba(232,57,95,0.35)",
      },
      borderRadius: {
        bubble: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
