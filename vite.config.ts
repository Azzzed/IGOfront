import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      /* ── Strategy: custom SW (needed for push event handlers) ── */
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',

      /* ── Auto-update silently on new deploy ── */
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      /* ── Web App Manifest ── */
      manifest: {
        name: 'IGO Manager',
        short_name: 'IGO',
        description: 'Prioriza y organiza las iniciativas de tu negocio',
        theme_color: '#0A0A0A',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            /* ?v=2 rompe la caché del SO/navegador para forzar re-descarga
               cuando el PNG ha cambiado pero el nombre de archivo es el mismo.
               Incrementar a ?v=3, ?v=4, etc. cada vez que se actualicen los PNGs. */
            src: '/icons/icon-192.png?v=3',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png?v=3',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512-maskable.png?v=3',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      /* ── What to precache (only static assets, NEVER API) ── */
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // API calls go to Railway domain (cross-origin) — never cached by SW.
        // In dev, the Vite proxy maps /api → localhost:8000 (same-origin),
        // so we explicitly deny it from the navigation fallback in sw.ts.
        globIgnores: ['**/node_modules/**'],
      },

      /* ── Enable SW in dev so we can inspect it in DevTools ── */
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
