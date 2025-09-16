import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ],
  esbuild: {
    // Drop all console statements in production builds only
    drop: mode === 'production' ? ['console'] : [],
  },
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
    // Optimize bundle size and tree-shaking
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-dropdown-menu'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
        },
      }
    },
    // Enable tree-shaking for better dead code elimination
    sourcemap: false,
    // Optimize chunk size with design token considerations
    chunkSizeWarningLimit: 1000,
    // CSS optimization
    cssCodeSplit: true,
    // Performance monitoring
    reportCompressedSize: true,
    // Enable minification of CSS variables
    cssMinify: 'esbuild',
  },
}))