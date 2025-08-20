module.exports = {
  extends: ['../../.eslintrc.js'],
  env: {
    node: true,
  },
  parserOptions: {
    project: './tsconfig.playwright.json',
  },
  rules: {
    // Prevent framework mixing - CRITICAL for Symbol collision prevention
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['vitest', '@vitest/*', 'vitest/*'],
            message: '❌ E2E tests cannot import from Vitest. Use @playwright/test instead.',
          },
          {
            group: ['jest', '@jest/*', 'jest/*'],
            message: '❌ E2E tests cannot import from Jest. Use @playwright/test instead.',
          },
          {
            group: ['**/*.test.*', '**/*.vitest.*'],
            message: '❌ E2E tests cannot import Vitest test files.',
          },
        ],
      },
    ],
    // Enforce Playwright patterns
    'no-restricted-globals': [
      'error',
      {
        name: 'describe',
        message: '❌ Use test.describe() from @playwright/test instead of global describe.',
      },
      {
        name: 'it',
        message: '❌ Use test() from @playwright/test instead of global it.',
      },
      {
        name: 'beforeEach',
        message: '❌ Use test.beforeEach() from @playwright/test instead of global beforeEach.',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.js'],
      rules: {
        // Allow Playwright test patterns
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
};