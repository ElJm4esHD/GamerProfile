/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Azul-pizarra profundo, no negro puro: menos fatiga, más Letterboxd.
        canvas: "#0d1520",
        surface: "#141d2a",
        raised: "#1f2b3a",
        line: "#25313f",
        ink: "#eef3f8",
        muted: "#8296aa",
        // Azul acero apagado. El acento se nota, no grita.
        accent: "#7ba3c9",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        // Los números siempre en mono: dígitos de ancho fijo, columnas alineadas.
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
