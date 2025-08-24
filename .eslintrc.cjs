module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'docs', 'tests', 'tests.backup.*', '*.backup.*', 'backups', 'src/utils/password-reset-test.ts', 'src/lib/supabase.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-refresh'],
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
    
    // Console usage warning - prevents console statements in production
    'no-console': 'warn',
    
    // React 18 JSX Transform - disable unnecessary React import requirement
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    
    // CRM Architecture Enforcement Rules
    'no-restricted-imports': ['error', {
      paths: [{
        name: '@supabase/supabase-js',
        importNames: ['createClient'],
        message: 'Use feature-specific hooks instead of direct Supabase calls in components. Import supabase from existing hook files only.'
      }],
      patterns: [
        {
          group: ['@/components/forms/entity-select/specialized/*'],
          message: 'Import specialized entity selects from their respective feature directories: @/features/contacts, @/features/organizations, or @/features/products'
        },
        {
          group: ['@/features/*/components/*'],
          importNamePattern: '^(.*Store|.*State)$',
          message: 'Feature components should not import Zustand stores directly. Use feature hooks instead.'
        }
      ]
    }],
    
    // State Management Architecture Rules
    'no-restricted-syntax': [
      'error',
      {
        selector: "ImportDeclaration[source.value='xlsx'] CallExpression[callee.name!='import']",
        message: 'Use dynamic import() for heavy libraries like xlsx to avoid bundle bloat'
      },
      {
        selector: "VariableDeclarator[id.name=/.*Store$/] Property[key.name=/^(data|isLoading|error|refetch)$/]",
        message: 'Server data properties (data, isLoading, error, refetch) should not be stored in Zustand stores. Use TanStack Query hooks instead.'
      },
      {
        selector: "TSPropertySignature[key.name=/^(created_at|updated_at|deleted_at|id)$/]",
        message: 'Server data fields should not be defined in client state interfaces. Store only IDs and UI state in Zustand stores.'
      }
    ],

    // File Organization Rules - Temporarily disabled until custom plugin is properly configured
    // 'no-restricted-modules': ['error', {
    //   patterns: [{
    //     group: ['src/components/**/Contact*', 'src/components/**/Organization*', 'src/components/**/Product*', 'src/components/**/Opportunity*', 'src/components/**/Interaction*'],
    //     message: 'Feature-specific components should be located in src/features/{feature}/components/ not in shared components directory'
    //   }]
    // }],

    // Custom CRM Architecture Rules - Temporarily disabled until custom plugin is properly configured
    // 'crm-architecture/no-server-data-in-stores': 'error',
    // 'crm-architecture/enforce-feature-imports': 'warn',
    // 'crm-architecture/validate-client-state': 'error',
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
