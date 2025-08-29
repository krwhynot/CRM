module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:tailwindcss/recommended',
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
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-refresh', 'tailwindcss'],
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
    
    // Technical Debt Management Rules
    'no-warning-comments': ['warn', {
      'terms': ['TODO', 'FIXME', 'HACK'],
      'location': 'anywhere'
    }],
    
    // React 18 JSX Transform - disable unnecessary React import requirement
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    
    // UI/UX Compliance - Tailwind CSS Rules
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/no-arbitrary-value': 'error', // Prevents p-[13px], bg-[#123456], etc.
    
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
    
    // UI/UX Compliance Rules - Prevent arbitrary CSS values
    'no-restricted-syntax': [
      'error',
      {
        selector: "Literal[value=/^bg-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/]",
        message: 'Use semantic color tokens instead of hardcoded Tailwind colors. Example: use "bg-destructive" instead of "bg-red-600" or "bg-success" instead of "bg-green-500"'
      },
      {
        selector: "Literal[value=/^text-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/]",
        message: 'Use semantic color tokens instead of hardcoded Tailwind colors. Example: use "text-destructive" instead of "text-red-600" or "text-success" instead of "text-green-500"'
      },
      {
        selector: "Literal[value=/^border-(red|green|blue|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/]",
        message: 'Use semantic color tokens instead of hardcoded Tailwind colors. Example: use "border-destructive" instead of "border-red-600" or "border-success" instead of "border-green-500"'
      },
      {
        selector: "Literal[value=/^bg-\\[var\\(--/]",
        message: 'Use proper Tailwind tokens instead of arbitrary CSS variables. Example: use "bg-mfb-cream" instead of "bg-[var(--mfb-cream)]"'
      },
      {
        selector: "Literal[value=/^text-\\[var\\(--/]",
        message: 'Use proper Tailwind tokens instead of arbitrary CSS variables. Example: use "text-mfb-green" instead of "text-[var(--mfb-green)]"'
      },
      {
        selector: "Literal[value=/^border-\\[var\\(--/]",
        message: 'Use proper Tailwind tokens instead of arbitrary CSS variables. Example: use "border-mfb-olive" instead of "border-[var(--mfb-olive)]"'
      },
      {
        selector: "Literal[value=/calc\\(/]",
        message: 'Avoid calc() expressions in className. Use standardized spacing tokens or create a utility class in CSS instead.'
      },
      {
        selector: "Literal[value=/\\d+vh/]",
        message: 'Avoid viewport height units in className. Use standardized height tokens like "h-96" or "min-h-screen" instead.'
      },
      // JSX-specific selectors for className attributes
      {
        selector: "JSXAttribute[name.name='className'] Literal[value=/calc\\(/]",
        message: 'Avoid calc() expressions in JSX className. Use standardized spacing tokens or create a utility class in CSS instead.'
      },
      {
        selector: "JSXAttribute[name.name='className'] Literal[value=/\\d+vh/]",
        message: 'Avoid viewport height units in JSX className. Use standardized height tokens like "h-96" or "min-h-screen" instead.'
      },
      {
        selector: "JSXAttribute[name.name='className'] Literal[value=/w-\\[calc\\(/]",
        message: 'Avoid calc() expressions in width classes. Use "w-full max-w-[96%]" or similar standard patterns instead.'
      }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
