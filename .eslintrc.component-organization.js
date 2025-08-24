// Component Organization ESLint Rules
// Add these rules to your main .eslintrc.js file

const componentOrganizationRules = {
  rules: {
    // Enforce PascalCase for React component files
    'filenames/match-exported': [
      'error',
      'pascal',
      '\\.(tsx|ts)$'
    ],
    
    // Custom rule to enforce component placement (would need custom implementation)
    // 'component-organization/correct-placement': 'error',
    
    // Prevent importing from wrong directories
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../features/*/components/*'],
            message: 'Do not import feature-specific components from other features. Move to shared components if needed across features.'
          },
          {
            group: ['../../features/*/components/*'],
            message: 'Do not import feature-specific components from other features. Move to shared components if needed across features.'
          },
          {
            group: ['@/features/*/components/*'],
            message: 'Feature-specific imports should use relative paths within the same feature, or be moved to shared components.'
          }
        ],
        paths: [
          {
            name: '@/components/ChartCard',
            message: 'ChartCard has been moved to @/features/dashboard/components/ChartCard'
          },
          {
            name: '@/components/QuickActions', 
            message: 'QuickActions has been moved to @/features/dashboard/components/QuickActions'
          },
          {
            name: '@/components/StatsCards',
            message: 'StatsCards has been moved to @/features/dashboard/components/StatsCards'
          }
        ]
      }
    ],

    // Ensure proper imports for moved components
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Prevent shared components from importing feature-specific code
          {
            target: './src/components',
            from: './src/features',
            message: 'Shared components should not import from feature directories. Consider moving the component to the appropriate feature.'
          },
          // Prevent features from importing from other features (except through shared)
          {
            target: './src/features/*/!(index.ts)',
            from: './src/features',
            except: ['./src/features/*/index.ts'],
            message: 'Features should not directly import from other features. Use shared components or create a shared utility.'
          }
        ]
      }
    ]
  }
};

// Additional custom rules that could be implemented
const customRulesSuggestions = {
  // These would require custom ESLint rule implementation
  'component-organization/feature-component-in-feature-dir': {
    description: 'Ensure components used by only one feature are in that feature directory'
  },
  'component-organization/shared-component-multi-feature-usage': {
    description: 'Ensure components in shared directory are used by multiple features'
  },
  'component-organization/consistent-file-naming': {
    description: 'Enforce PascalCase for component files'
  },
  'component-organization/proper-index-exports': {
    description: 'Ensure moved components are properly exported from feature indices'
  }
};

module.exports = {
  ...componentOrganizationRules,
  // Note: Custom rules would need to be implemented and added to a custom ESLint plugin
  customRulesSuggestions
};