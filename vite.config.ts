import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Ensure SPA routing works correctly in development
    historyApiFallback: true,
  },
  build: {
    // Ensure proper handling of hash routing in production
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})