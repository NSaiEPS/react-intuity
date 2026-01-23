import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  cacheDir: ".vite-cache",

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 3001,
  },

  optimizeDeps: {
    force: true,
    // exclude: ["@react-pdf/renderer"], // only if needed
  },

  build: {
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-apexcharts")) return "charts";
            if (id.includes("apexcharts")) return "charts";
            if (id.includes("@mui")) return "mui";
            return "vendor";
          }
        },
      },
    },
  },

  base: "/",
});
