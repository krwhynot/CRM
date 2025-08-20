module.exports = {
  extends: ['../../.eslintrc.js'],
  env: {
    node: true,
  },
  rules: {
    // Shared utilities CANNOT import test framework specifics
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@playwright/test', 'playwright', 'playwright/*'],
            message: '❌ Shared utilities cannot import Playwright test framework.',
          },
          {
            group: ['vitest', '@vitest/*', 'vitest/*'],
            message: '❌ Shared utilities cannot import Vitest test framework.',
          },
          {
            group: ['jest', '@jest/*', 'jest/*'],
            message: '❌ Shared utilities cannot import Jest test framework.',
          },
        ],
      },
    ],
    // Only allow framework-agnostic utilities
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.js'],
      rules: {
        // Shared utilities should be pure TypeScript/JavaScript
        '@typescript-eslint/explicit-function-return-type': 'warn',
      },
    },
  ],
};