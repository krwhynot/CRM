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
          vendor: ['react', 'react-dom', 'react-router-dom'],
          radix: [
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-checkbox'
          ],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns'],
          charts: ['recharts'],
          files: ['papaparse', 'react-window'],
          monitoring: ['web-vitals']
        },
      },
      // Exclude development-only components from production builds
      external: mode === 'production' ? [
        // Development pages that should be excluded from production
        /^.*\/pages\/StyleGuide$/,
        /^.*\/pages\/StyleGuideTest$/,
      ] : [],
    },
    // Enable tree-shaking for better dead code elimination
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Improve tree-shaking
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
    } : undefined,
  },
}))