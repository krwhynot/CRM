import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { createCssTreeShakingPlugin } from './scripts/optimize-css-variables.js'
// OKLCH converter plugin has completed its task - new token system is now active
// import { oklchConverterPlugin } from './src/lib/build-plugins/oklch-converter.js'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // OKLCH to HSL conversion plugin - COMPLETED, no longer needed after atomic replacement
    // oklchConverterPlugin({
    //   inputFile: 'src/styles/tokens/primitives-new.css',
    //   outputFile: 'src/styles/tokens/primitives.css',
    //   watchMode: true,
    //   enableCaching: true,
    //   logLevel: mode === 'development' ? 'info' : 'info'
    // }),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    }),
    createCssTreeShakingPlugin({
      mode,
      outputDir: 'dist/optimized-tokens',
      debug: mode === 'development',
      verbose: mode === 'development',
      enableCaching: true,
      parallelProcessing: true,
      // Enhanced preservation list with new brand tokens
      preserveVariables: [
        // Core shadcn/ui variables
        '--background',
        '--foreground',
        '--card',
        '--card-foreground',
        '--popover',
        '--popover-foreground',
        '--primary',
        '--primary-foreground',
        '--secondary',
        '--secondary-foreground',
        '--muted',
        '--muted-foreground',
        '--accent',
        '--accent-foreground',
        '--destructive',
        '--destructive-foreground',
        '--border',
        '--input',
        '--ring',
        '--radius',
        // Enhanced design system tokens
        '--warning',
        '--warning-foreground',
        '--info',
        '--info-foreground',
        '--success',
        '--success-foreground',
        // Core brand tokens (always preserve for design consistency)
        '--brand-primary',
        '--brand-secondary',
        '--brand-accent'
      ]
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
    host: true,
    port: 5173,
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
          'design-tokens': [
            // Design token utility modules
            './src/lib/design-token-types.ts',
            './src/lib/design-token-utils.ts',
          ],
        },
      },
      // CSS tree-shaking now handled by createCssTreeShakingPlugin above
      plugins: []
    },
    // Enable tree-shaking for better dead code elimination
    sourcemap: false,
    // Optimize chunk size with design token considerations
    chunkSizeWarningLimit: 1000,
    // CSS optimization with advanced design token handling
    cssCodeSplit: true,
    // Performance monitoring
    reportCompressedSize: true,
    // Enable minification of CSS variables with optimization
    cssMinify: mode === 'production' ? 'esbuild' : false,
    // Design token optimization settings
    minify: mode === 'production' ? 'esbuild' : false,
  },
}))