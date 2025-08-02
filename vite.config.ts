import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path"; // ✅ use `node:path` for compatibility with ESM
import { fileURLToPath } from "url";

// ✅ emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // maps @ to /src
    },
  },
  server: {
    port: 3000, // 👈 change port here
  },
});
