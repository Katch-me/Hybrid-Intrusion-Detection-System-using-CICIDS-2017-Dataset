/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#060A12",
        panel: "#0D1320",
        "panel-2": "#121A2A",
        border: "#1C2738",
        "border-soft": "#151E2E",
        text: "#E8EEF5",
        "text-soft": "#8C9AB0",
        "text-dim": "#4C5870",
        safe: "#3DDC97",
        alert: "#FF6B5B",
        signal: "#5EB1FF",
        amber: "#FFC857",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      spacing: {
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
        '6.5': '1.625rem', // 26px
        '7.5': '1.875rem', // 30px
      },
      backgroundImage: {
        'scanlines': "linear-gradient(rgba(94, 177, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(94, 177, 255, 0.035) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
