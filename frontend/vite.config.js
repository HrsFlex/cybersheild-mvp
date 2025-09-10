import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'static',
  server: {
    port: 5175,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      port: 5175,
      host: 'localhost',
      clientPort: 5175
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
})