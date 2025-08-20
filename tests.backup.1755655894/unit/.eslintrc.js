module.exports = {
  extends: ['../../.eslintrc.js'],
  env: {
    node: true,
  },
  parserOptions: {
    project: './tsconfig.vitest.json',
  },
  rules: {
    // Prevent framework mixing - CRITICAL for Symbol collision prevention
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@playwright/test', 'playwright', 'playwright/*'],
            message: '❌ Unit tests cannot import from Playwright. Use vitest instead.',
          },
          {
            group: ['**/*.spec.*', '**/*.playwright.*'],
            message: '❌ Unit tests cannot import Playwright test files.',
          },
        ],
      },
    ],
    // Enforce Vitest patterns
    'no-restricted-globals': [
      'error',
      {
        name: 'test',
        message: '❌ Use test() from vitest import instead of global test.',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.js'],
      rules: {
        // Allow Vitest test patterns
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
};