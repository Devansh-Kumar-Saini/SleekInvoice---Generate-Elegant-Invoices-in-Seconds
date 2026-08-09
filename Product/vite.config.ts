import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Split the eagerly-loaded entry chunk so the browser can cache
        // slow-changing vendor code (React, Radix UI primitives) separately
        // from app code that changes on every deploy. Without this, editing
        // one line anywhere invalidates a single monolithic bundle and
        // forces a full re-download on every repeat visit.
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-slot",
            "@radix-ui/react-label",
          ],
          "vendor-forms": ["react-hook-form", "zod"],
          "vendor-toast": ["react-toastify"],
        },
      },
    },
  }
});
