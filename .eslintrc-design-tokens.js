/**
 * ESLint Configuration for Design Token Enforcement
 * 
 * Custom rules to enforce design token usage and prevent hardcoded values
 * in the CRM codebase. This ensures consistent design system adoption.
 */

module.exports = {
  extends: ['./.eslintrc.cjs'],
  rules: {
    // Prevent hardcoded Tailwind spacing classes
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TemplateLiteral[quasis.0.value.raw~=/\\b(p|m|px|py|pl|pr|pt|pb|mx|my|ml|mr|mt|mb)-(0|1|2|3|4|5|6|8|10|12|16|20|24)\\b/]',
        message: 'Use semantic spacing tokens instead of hardcoded Tailwind spacing classes. Import from @/styles/tokens',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw~=/\\btext-(xs|sm|base|lg|xl|2xl|3xl)\\b/]',
        message: 'Use semantic typography tokens instead of hardcoded text size classes. Import from @/styles/tokens',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw~=/\\bbg-(white|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d+\\b/]',
        message: 'Use semantic color tokens instead of hardcoded color classes. Import from @/styles/tokens',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw~=/\\btext-(white|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d+\\b/]',
        message: 'Use semantic text color tokens instead of hardcoded text color classes. Import from @/styles/tokens',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw~=/\\bborder-(white|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d+\\b/]',
        message: 'Use semantic border color tokens instead of hardcoded border color classes. Import from @/styles/tokens',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw~=/\\bshadow-(sm|md|lg|xl|2xl)\\b/]',
        message: 'Use semantic shadow tokens instead of hardcoded shadow classes. Import from @/styles/tokens',
      },
      {
        selector: 'TemplateLiteral[quasis.0.value.raw~=/\\brounded-(sm|md|lg|xl|2xl|3xl)\\b/]',
        message: 'Use semantic radius tokens instead of hardcoded border radius classes. Import from @/styles/tokens',
      },
    ],

    // Prevent hardcoded values in string literals
    'no-restricted-properties': [
      'error',
      {
        object: 'cn',
        message: 'Consider using semantic tokens for className values. Import from @/styles/tokens',
      },
    ],
  },
  overrides: [
    {
      files: ['src/styles/tokens/**/*.ts'],
      rules: {
        // Allow hardcoded values in token definition files
        'no-restricted-syntax': 'off',
        'no-restricted-properties': 'off',
      },
    },
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        // Relax token enforcement in test files
        'no-restricted-syntax': 'warn',
      },
    },
  ],
}