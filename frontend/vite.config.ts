import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // El frontend habla con "/api" y Vite lo reenvía al backend.
    // Así no hay URLs hardcodeadas ni problemas de CORS.
    proxy: { "/api": "http://127.0.0.1:4000" },
    // Necesario en monorepo: shared/ vive fuera de frontend/.
    fs: { allow: [".."] },
  },
  optimizeDeps: { exclude: ["@gp/shared"] },
});
