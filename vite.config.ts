import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3001,
  },
  build: {
    chunkSizeWarningLimit: 300, // so Vite warns if chunks get too big
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-apexcharts")) return "charts";
            if (id.includes("apexcharts")) return "charts";
            if (id.includes("@mui")) return "mui";
            return "vendor"; // everything else in node_modules
          }
        },
      },
    },
    minify: "esbuild", // faster & smaller
    sourcemap: false, // disable in prod for smaller size
  },
  optimizeDeps: {
    include: ["react", "react-dom"], // pre-bundle common deps
  },
});
