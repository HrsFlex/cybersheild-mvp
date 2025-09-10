import { defineConfig } from 'vite'

// Alternative Vite configuration for environments with WebSocket issues
export default defineConfig({
  root: '.',
  publicDir: 'static',
  server: {
    port: 5175,
    host: 'localhost',
    strictPort: true,
    // Disable HMR over WebSocket if having issues
    hmr: false,
    // Alternative: Use polling instead of WebSocket
    // hmr: {
    //   port: 5175,
    //   host: 'localhost'
    // },
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
  define: {
    global: 'globalThis'
  }
})