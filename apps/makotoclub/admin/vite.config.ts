import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Use the installed workspace package so zod resolves via node_modules
      "@makotoclub/shared": path.resolve(__dirname, "node_modules/@makotoclub/shared/src"),
      zod: path.resolve(__dirname, "node_modules/zod"),
    },
  },
  server: {
    port: 4174,
  },
  build: {
    commonjsOptions: {
      include: [/packages\/makotoclub-shared/, /node_modules/],
    },
  },
});
