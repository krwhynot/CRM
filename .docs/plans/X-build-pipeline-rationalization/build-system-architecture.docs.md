# Build System Architecture

## Core Build Tools

### **Vite**: Modern Build Tool & Development Server
- **Version**: 7.1.4
- **Configuration**: `vite.config.ts`
- **Key Features**:
  - React plugin with JSX transform
  - Bundle visualizer integration (`rollup-plugin-visualizer`)
  - Path alias support (`@/` → `./src/`)
  - Manual chunk splitting for optimal caching
  - Production optimizations (tree-shaking, minification)
  - SPA routing with history API fallback

**Build Optimizations**:
```typescript
// Manual chunks for optimized caching
manualChunks: {
  vendor: ['react', 'react-dom'],
  ui: ['@radix-ui/react-*'],
  router: ['react-router-dom'],
  supabase: ['@supabase/supabase-js'],
  query: ['@tanstack/react-query']
}
```

**Performance Features**:
- Console statement removal in production (`esbuild.drop`)
- Source maps disabled for production
- CSS code splitting enabled
- Gzip size reporting via visualizer
- Bundle size warning at 1000KB threshold

### **TypeScript**: Strict Type System Configuration
- **Version**: 5.0.2
- **Configuration**: `tsconfig.json`, `tsconfig.architectural.json`, `tsconfig.node.json`, `tsconfig.vitest.json`
- **Compilation Target**: ES2020 with DOM support
- **Module System**: ESNext with bundler resolution

**Strict Configuration**:
```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitReturns": true,
  "exactOptionalPropertyTypes": true
}
```

**Path Aliases**:
- `@/*` → `./src/*`
- `@/features/*` → `./src/features/*`
- `@/shared/*` → `./src/components/shared/*`
- `@/layout/*` → `./src/layout/*`

### **ESLint**: Architectural Enforcement & Code Quality
- **Version**: 8.45.0
- **Configuration**: `.eslintrc.cjs`
- **Plugins**: React, React Hooks, TypeScript, Tailwind CSS

**Custom Architectural Rules**:
1. **State Management Enforcement**:
   - Prevents server data fields in Zustand stores
   - Enforces TanStack Query for server state
   - Validates proper client/server state separation

2. **Component Organization Rules**:
   - Prevents cross-feature component imports
   - Enforces proper component directory structure
   - Validates component naming conventions

3. **Import Restrictions**:
   - Blocks direct Supabase client imports in components
   - Enforces feature-based organization patterns
   - Prevents deep relative imports (suggests path aliases)

4. **UI/UX Compliance**:
   - Blocks arbitrary CSS values (prevents `p-[13px]`)
   - Enforces semantic color tokens over hardcoded colors
   - Validates design system consistency

## Testing Architecture

### **Vitest**: Backend & Unit Testing Framework
- **Version**: 3.2.4
- **Configuration**: `vitest.config.ts`
- **Environment**: jsdom with globals enabled
- **Coverage**: v8 provider with HTML/JSON/text reporting

**Test Categories**:
```bash
# Backend Testing (Vitest)
npm run test:backend           # All backend tests
npm run test:backend:coverage  # With coverage reports
npm run test:db               # Database-specific tests
npm run test:performance      # Performance benchmarks
npm run test:security         # RLS policy validation
npm run test:architecture     # Architecture pattern validation
```

**Test Setup** (`tests/backend/setup/test-setup.ts`):
- Supabase test client configuration (service role & anon keys)
- Test authentication utilities
- Performance monitoring integration
- Automatic test data cleanup
- Mock user management for RLS testing

### **Custom Test Runners**: Node.js MCP Integration Tests
- **Location**: `tests/mcp/`
- **Framework**: Native Node.js with custom test utilities
- **Purpose**: End-to-end MCP tool integration testing

**MCP Test Categories**:
```bash
npm run test              # All MCP integration tests
npm run test:auth         # Authentication flow tests
npm run test:crud         # CRUD operation tests
npm run test:dashboard    # Dashboard functionality tests
npm run test:mobile       # Mobile/responsive tests
```

### **Architecture Tests**: Custom Validation Framework
**Location**: `tests/architecture/`
**Validation Script**: `scripts/validate-architecture.js`

**Architecture Validation Rules**:
1. **Component Organization**: Validates proper feature/shared component placement
2. **State Boundaries**: Ensures TanStack Query vs Zustand separation
3. **Import Patterns**: Prevents cross-feature imports and deep relative imports
4. **Naming Conventions**: Enforces PascalCase components, camelCase hooks
5. **File Size Limits**: Prevents overly large components/files

**Performance Pattern Tests**:
- Bundle size validation (<3MB total)
- Component optimization patterns
- Query performance benchmarks (<5ms for simple queries)
- Mobile-first responsive validation

## Performance & Analysis

### **Bundle Analysis**: Comprehensive Size Monitoring
**Tools**:
- `rollup-plugin-visualizer`: Interactive bundle size analysis
- `vite-bundle-visualizer`: CLI bundle analysis
- Production gzip size reporting

**Commands**:
```bash
npm run analyze           # Interactive bundle visualizer
npm run build            # Production build with size reports
npm run optimize:performance # Performance optimization analysis
```

**Bundle Optimization Strategy**:
- Vendor chunk separation (React, UI libraries)
- Router chunk isolation for lazy loading
- Supabase client code separation
- TanStack Query isolated chunk
- Design token tree-shaking in production

### **Performance Monitoring**: Multi-Layer Analysis
**Scripts**:
- `scripts/performance-monitor.sh`: Comprehensive performance audit
- `scripts/measure-performance-baseline.js`: Baseline establishment
- `scripts/validate-responsive-filter-performance.js`: Filter-specific analysis

**Performance Metrics**:
1. **Bundle Analysis**: Size breakdown, chunk analysis
2. **TypeScript Compilation**: Build time monitoring
3. **Dev Server Startup**: Development experience metrics
4. **Database Performance**: Query timing via pg_stat_statements
5. **Mobile Optimization**: Responsive component analysis

**Monitoring Features**:
- Performance threshold validation
- Slow query detection and logging
- Build time regression tracking
- Bundle size threshold warnings

### **Optimization Tools**: Automated Performance Enhancement
**Build Optimizations**:
- Tree-shaking for dead code elimination
- CSS variable optimization in production
- Dynamic imports for heavy libraries (xlsx, chart libraries)
- Image optimization and WebP format support
- Service worker caching strategies

**Development Optimizations**:
- Hot module replacement (HMR) optimization
- Incremental TypeScript compilation
- Path alias resolution caching
- Development server performance tuning

## Development Tools

### **Hot Reload**: Optimized Development Experience
**Vite Dev Server Features**:
- Fast HMR with React refresh
- Instant TypeScript compilation
- CSS hot reloading
- Import analysis caching
- Development proxy configuration

**Performance Monitoring**:
- Dev server startup time tracking
- HMR update timing
- Module resolution performance
- Development bundle size monitoring

### **Code Generation**: Automated Component Creation
**Development Assistant** (`scripts/dev-assistant.js`):
- Component scaffolding with architectural patterns
- Feature structure generation
- Hook template creation with TanStack Query
- Zustand store generation with type safety
- Test file creation with proper setup

**Commands**:
```bash
npm run dev:assist create component ContactForm contacts
npm run dev:assist create feature analytics
npm run dev:assist create hook useOrganizations
npm run dev:assist analyze        # Codebase health analysis
```

### **Development Helpers**: Quality & Health Monitoring
**Health Check System**:
```bash
npm run dev:health               # Development environment health check
npm run dev:fix                  # Auto-fix common development issues
npm run validate:architecture    # Architecture pattern validation
npm run quality-gates           # Comprehensive 6-stage quality validation
```

**Technical Debt Management**:
```bash
npm run debt:audit              # Technical debt analysis
npm run debt:scan               # Pattern-based debt detection
npm run debt:report             # Comprehensive debt reporting
npm run debt:issues             # GitHub issue creation for debt items
```

## Configuration Files

### **Key Config Files**:

1. **`vite.config.ts`**: Build tool configuration
   - React plugin setup
   - Bundle optimization
   - Development server configuration
   - Production optimizations

2. **`tsconfig.json`**: TypeScript compilation
   - Strict type checking
   - Path alias configuration
   - Module resolution strategy

3. **`tsconfig.architectural.json`**: Stricter architectural validation
   - Enhanced type checking
   - Unused code detection
   - Exact optional property types

4. **`.eslintrc.cjs`**: Code quality & architectural enforcement
   - Custom architectural rules
   - State management validation
   - Component organization rules

5. **`vitest.config.ts`**: Testing framework configuration
   - Test environment setup
   - Coverage reporting
   - Database test isolation

6. **`tailwind.config.js`**: Design system configuration
   - Custom color tokens
   - Component-specific utilities
   - Responsive breakpoints

7. **`postcss.config.js`**: CSS processing
   - Tailwind CSS integration
   - Autoprefixer configuration

### **Environment Setup**:
```bash
# Required Environment Variables
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development & Testing (Optional)
SUPABASE_SERVICE_ROLE_KEY=service_role_key_for_tests
NODE_ENV=development
```

**Build Modes**:
- `development`: Full source maps, console statements, dev server
- `production`: Minified, tree-shaken, optimized chunks
- `test`: Test environment with mock configurations

## Quality Gates & Validation Pipeline

### **6-Stage Quality Gates** (`scripts/run-quality-gates.sh`):
1. **TypeScript Compilation**: Strict type checking validation
2. **Code Linting**: ESLint with architectural rules
3. **Component Architecture**: Health score validation (80%+ required)
4. **Build & Bundle Analysis**: Size limits and build success
5. **Performance Baseline**: Performance monitoring completion
6. **Mobile Optimization**: Responsive design validation

### **Continuous Validation**:
```bash
npm run validate              # Complete validation pipeline
npm run quality-gates         # Full 6-stage quality validation
npm run hooks:install         # Git pre-commit hook setup
```

### **Architecture Enforcement**:
- State boundary validation (TanStack Query vs Zustand)
- Component placement validation
- Import pattern enforcement
- Performance baseline maintenance
- Mobile-first responsive design compliance

## Integration & Deployment

### **CI/CD Integration**:
- Quality gates as CI validation steps
- Bundle size monitoring in CI
- Performance regression detection
- Architecture compliance checking
- Comprehensive test suite execution

### **Deployment Optimizations**:
- Production bundle optimization
- CDN asset optimization
- Service worker implementation
- Performance monitoring integration
- Error tracking and reporting

### **Development Workflow**:
1. **Pre-commit**: Architecture validation, lint checks
2. **Development**: Hot reload, health monitoring, assistant tools
3. **Testing**: Comprehensive test suite, performance benchmarks
4. **Quality Gates**: 6-stage validation pipeline
5. **Deployment**: Optimized production build, monitoring setup

This build system architecture provides comprehensive development tooling, quality enforcement, and performance optimization for the KitchenPantry CRM system, ensuring maintainable and scalable development practices.