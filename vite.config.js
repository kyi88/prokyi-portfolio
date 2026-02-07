import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['avatar.jpg'],
      manifest: {
        name: 'prokyi — Cyberdeck Portfolio',
        short_name: 'prokyi',
        description: 'ぷろきぃ (prokyi) のサイバーパンク・ポートフォリオ',
        theme_color: '#05070e',
        background_color: '#05070e',
        display: 'standalone',
        orientation: 'any',
        start_url: '/prokyi-portfolio/',
        scope: '/prokyi-portfolio/',
        categories: ['portfolio', 'developer'],
        icons: [
          {
            src: 'avatar.jpg',
            sizes: '161x161',
            type: 'image/jpeg',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,jpg,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: '/prokyi-portfolio/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber'],
          'framer-motion': ['framer-motion'],
          tone: ['tone'],
        },
      },
    },
  },
});
