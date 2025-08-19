/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/backend/setup/test-setup.ts'],
    teardownTimeout: 30000,
    testTimeout: 30000,
    threads: false, // Important for database tests to avoid conflicts
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    },
    pool: 'forks', // Ensures each test file runs in isolation
    poolOptions: {
      forks: {
        singleFork: true // All tests in single process to avoid DB connection issues
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})