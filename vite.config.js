import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    fs: {
      allow: [
        '..',
        'C:/Users/asus/.gemini/antigravity'
      ]
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
