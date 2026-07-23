import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#12111A",
        surface: "#1C1A26",
        "surface-hover": "#262331",
        "surface-raised": "#211F2C",
        border: "#322E40",
        "text-primary": "#F2EFF7",
        "text-muted": "#9C96AE",
        spark: {
          DEFAULT: "#FF5C79",
          dim: "#B3455A",
          glow: "#FF8FA3",
        },
        violet: {
          DEFAULT: "#7C6FFF",
          dim: "#5A50B8",
        },
        online: "#33D6A6",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      boxShadow: {
        "spark-glow": "0 0 0 1px rgba(255,92,121,0.25), 0 8px 24px -8px rgba(255,92,121,0.35)",
      },
      borderRadius: {
        bubble: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
