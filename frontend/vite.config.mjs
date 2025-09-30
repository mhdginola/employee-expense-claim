import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [vue()],
  base: "./",
  css: {
    postcss: {
      plugins: [
        autoprefixer(), // default sudah cukup
      ],
    },
  },
  resolve: {
    alias: {
      // Hilangkan duplikat, cukup gunakan satu
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [
      ".mjs",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
      ".vue",
      ".scss",
    ],
  },
  server: {
    port: 3000,
  },
});
