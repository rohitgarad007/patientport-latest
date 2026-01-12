import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Prevent sensitive environment variables from being embedded in build
    // Only allow non-sensitive variables to be embedded
    ...(mode === 'production' ? {
      'import.meta.env.VITE_API_KEY': 'undefined',
      'import.meta.env.VITE_API_KEY_DEEPSEEK': 'undefined',
      'import.meta.env.VITE_FIREBASE_API_KEY': 'undefined',
      'import.meta.env.VITE_AES_SECRET_KEY': 'undefined',
    } : {})
  },
  build: {
    // Additional security measures for production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
  },
}));
