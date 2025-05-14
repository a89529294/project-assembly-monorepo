import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
// import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    // visualizer({ open: true }),
  ],
  resolve: {
    conditions: ["source"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk for React and React DOM
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "vendor-react";
          }
          // Vendor chunk for TanStack Router
          if (id.includes("node_modules/@tanstack/react-router")) {
            return "vendor-tanstack";
          }
          // Vendor chunk for date-fns
          if (id.includes("node_modules/date-fns")) {
            return "vendor-date-fns";
          }
          // Vendor chunk for react-day-picker
          if (id.includes("node_modules/react-day-picker")) {
            return "vendor-react-day-picker";
          }
          // Shared monorepo package
          if (id.includes("@myapp/shared")) {
            return "shared";
          }
        },
      },
    },
  },
});
