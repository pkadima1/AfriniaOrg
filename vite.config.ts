import { defineConfig, type Plugin } from "vite";
import { copyFile } from "fs/promises";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Emits dist/404.html as a copy of the built index.html.
 * WHY: Netlify serves /404.html with HTTP 404 for any URL that no file,
 * function path (e.g. /sitemap.xml) or rule in public/_redirects claims.
 * Visitors still get the app (its Not Found page); crawlers get a true 404
 * instead of a "soft 404". A `/* /index.html 404` rewrite cannot do this: it
 * outranks function paths and swallowed /sitemap.xml (verified on a draft
 * deploy, 2026-09-30).
 */
function notFoundPage(): Plugin {
  let outDir = "dist";
  return {
    name: "afrinia-404-page",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      await copyFile(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    // Forward Netlify function calls to the netlify dev proxy (port 8888).
    // Without this, fetch('/.netlify/functions/...') from localhost:8080 hits Vite
    // directly and returns 404 — Vite has no knowledge of Netlify functions.
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    notFoundPage(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
