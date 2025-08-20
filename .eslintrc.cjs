module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'crm-dashboard', 'docs', 'tests', 'tests.backup.*', '*.backup.*', 'backups', 'src/utils/password-reset-test.ts', 'src/lib/supabase.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn', // TODO: Fix type safety post-deployment
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // CRM Architecture Enforcement Rules
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@supabase/supabase-js'],
        importNames: ['createClient'],
        message: 'Use feature-specific hooks instead of direct Supabase calls in components. Import supabase from existing hook files only.',
        ignoreFilePattern: 'src/lib/supabase.ts'
      }]
    }],
    
    // Performance and bundle size awareness
    'no-restricted-syntax': ['error', {
      selector: "ImportDeclaration[source.value='xlsx'] CallExpression[callee.name!='import']",
      message: 'Use dynamic import() for heavy libraries like xlsx to avoid bundle bloat'
    }],
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}