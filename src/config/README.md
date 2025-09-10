# Configuration Directory

This directory contains all centralized configuration files for the CRM application. This structure was created to eliminate hardcoded values throughout the codebase and improve maintainability.

## Files Overview

### `environment.ts`
- **Purpose**: Centralized access to all environment variables
- **Replaces**: Direct `import.meta.env.*` usage throughout the app
- **Features**: Environment validation, feature flags, type safety
- **Usage**: `import { supabaseConfig, isDevelopment } from '@/config/environment'`

### `urls.ts`  
- **Purpose**: URL constants, placeholders, and validation utilities
- **Replaces**: Hardcoded URLs in forms and components
- **Features**: URL validation patterns, formatting helpers
- **Usage**: `import { placeholderUrls, validateUrl } from '@/config/urls'`

### `form-placeholders.ts`
- **Purpose**: Consistent form placeholders, labels, and validation messages
- **Replaces**: Hardcoded placeholder strings in form components
- **Features**: Context-aware placeholders, i18n-ready structure
- **Usage**: `import { contactPlaceholders, getPlaceholder } from '@/config/form-placeholders'`

### `ui-styles.ts`
- **Purpose**: UI styles for development tools and utilities
- **Replaces**: Hardcoded CSS colors in development scripts
- **Features**: CSS variable generation, design token management
- **Usage**: `import { devToolColors, generateDevToolCSS } from '@/config/ui-styles'`

### `index.ts`
- **Purpose**: Convenient re-exports of all configuration modules
- **Usage**: `import { supabaseConfig, placeholderUrls } from '@/config'`

## Migration Summary

### Before Refactoring
```typescript
// Scattered throughout codebase
const url = import.meta.env.VITE_SUPABASE_URL
const placeholder = 'https://www.organization.com'
const isDev = import.meta.env.NODE_ENV === 'development'
```

### After Refactoring  
```typescript
// Centralized and type-safe
import { supabaseConfig, placeholderUrls, isDevelopment } from '@/config'

const url = supabaseConfig.url
const placeholder = placeholderUrls.organization
const isDev = isDevelopment
```

## Benefits

1. **Single Source of Truth**: All configuration values in one place
2. **Type Safety**: Full TypeScript support with IntelliSense
3. **Easy Maintenance**: Update values in one location
4. **Better Testing**: Centralized test constants and mock data
5. **Internationalization Ready**: Structured for future i18n support
6. **Environment Validation**: Built-in checks for required variables

## Usage Guidelines

1. **Import from centralized configs**: Always use `@/config/*` imports instead of direct environment access
2. **Add new constants here**: When adding new hardcoded values, place them in the appropriate config file
3. **Use helper functions**: Leverage validation and formatting utilities provided
4. **Maintain type safety**: Keep TypeScript definitions up to date

## Test Configuration

Test-specific constants are located in `tests/config/test-constants.ts` and follow the same centralization principles for test URLs, viewport sizes, and mock data.

## Related Files Updated

During this refactoring, the following key files were updated:
- `src/lib/supabase.ts` - Environment config usage
- `src/lib/openai.ts` - Environment config usage  
- `src/contexts/AuthContext.tsx` - Environment config usage
- `src/features/*/components/*Form.tsx` - Form placeholder usage
- `src/components/dashboard/chart-colors.ts` - CSS variable usage
- `scripts/typescript-error-agent.js` - UI styles usage
- `tests/shared/test-utilities.ts` - Test config usage

## Future Enhancements

- [ ] Add internationalization (i18n) support
- [ ] Implement runtime configuration validation
- [ ] Add configuration schema documentation
- [ ] Create configuration migration utilities