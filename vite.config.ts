import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // service worker akan auto-update
      injectRegister: "auto",
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // file aset tambahan
      manifest: {
        name: 'My Vite React PWA',
        short_name: 'VitePWA',
        description: 'Contoh implementasi PWA dengan Vite + React',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
        ]
      }
    })
  ],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
