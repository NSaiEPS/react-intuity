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
    dedupe: ["react", "react-dom"],
  },

  server: {
    allowedHosts: true,
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
    ],
  },

  build: {
    sourcemap: false,
    minify: "esbuild",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 400,

    rollupOptions: {
      output: {
        // ✅ Cache busting for S3
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",

        manualChunks(id) {
          // ── React core ──────────────────────────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // ── Router ──────────────────────────────────────────
          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run")
          ) {
            return "vendor-router";
          }

          // ── Charts (heavy) ──────────────────────────────────
          if (
            id.includes("node_modules/apexcharts") ||
            id.includes("node_modules/react-apexcharts")
          ) {
            return "vendor-charts";
          }

          // ── MUI (heavy) ─────────────────────────────────────
          if (
            id.includes("node_modules/@mui") ||
            id.includes("node_modules/@emotion")
          ) {
            return "vendor-mui";
          }

          // ── Auth pages ──────────────────────────────────────
          if (
            id.includes("src/components/auth") ||
            id.includes("src/pages/auth")
          ) {
            return "chunk-auth";
          }

          // ── Dashboard pages ─────────────────────────────────
          if (id.includes("src/pages/dashboard")) {
            return "chunk-dashboard";
          }

          // ── Remaining node_modules ──────────────────────────
          if (id.includes("node_modules")) {
            return "vendor-misc";
          }
        },
      },
    },
  },

  base: "/",
});