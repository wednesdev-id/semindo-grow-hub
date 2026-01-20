import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: [
      'dev.sinergiumkmindonesia.com',
      'sinergiumkmindonesia.com',
      'localhost',
    ],
    // HMR config only for Cloudflare tunnel (production/staging)
    // For localhost, use default HMR settings
    ...(process.env.VITE_HMR_CLOUDFLARE === 'true' ? {
      hmr: {
        clientPort: 443,
        protocol: 'wss',
      },
    } : {}),
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), svgr(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/core"),
    },
  },
}));
