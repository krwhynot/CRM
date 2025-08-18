# Development Workflow Guide
*Day-to-day development processes for KitchenPantry CRM*

## Overview

This guide outlines the development workflow, quality gates, and best practices for contributing to the KitchenPantry CRM system.

## Development Methodology

### Vertical Scaling Workflow

The project follows a vertical scaling workflow that focuses on complete feature implementation before moving to the next feature:

#### Stage 1: Database Implementation
- Design database schema for the feature
- Apply database migrations
- Generate TypeScript types
- Implement validation checklist

#### Stage 2: Type Definitions & Interfaces  
- Create feature-specific TypeScript types
- Define validation schemas with Yup
- Create API interface definitions

#### Stage 3: Service Layer
- Implement service classes extending BaseService
- Create React Query hooks for data fetching
- Implement mutation hooks with optimistic updates

#### Stage 4: Component Implementation
- Create form components with proper validation
- Build list/table components with search and filtering
- Implement modal dialogs and detail views

#### Stage 5: Route Integration
- Add new routes to React Router configuration
- Create page components that compose feature components
- Update navigation and breadcrumbs

#### Stage 6: Testing & Validation
- Manual testing checklist completion
- User acceptance testing validation
- Performance testing and optimization

#### Stage 7: Documentation & Deployment
- Update technical documentation
- Production deployment verification
- Monitor performance and error rates

## Quality Gates

### Pre-Development Checklist
- [ ] Feature requirements clearly defined
- [ ] Database schema changes documented
- [ ] API changes documented
- [ ] UI mockups available (if applicable)
- [ ] Acceptance criteria defined

### Development Quality Gates

#### Code Quality (Must Pass Before PR)
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] ESLint validation passes (`npm run lint`)
- [ ] No console.log statements in production code
- [ ] All imports use path aliases (`@/` prefix)
- [ ] Proper error handling implemented

#### Database Quality (For Schema Changes)
- [ ] Migration script tested on development database
- [ ] RLS policies updated for new tables/columns
- [ ] Database indexes added for foreign keys
- [ ] Soft delete patterns implemented (`deleted_at`)
- [ ] Audit fields added (`created_at`, `updated_at`)

#### Component Quality
- [ ] Components use shadcn/ui primitives where possible
- [ ] Form components implement proper validation
- [ ] Loading states and error boundaries implemented
- [ ] Mobile-responsive design verified on iPad
- [ ] Accessibility attributes included (ARIA labels)

#### API Quality
- [ ] All endpoints include proper error handling
- [ ] Query results limited with LIMIT clauses
- [ ] Soft delete filtering applied (`WHERE deleted_at IS NULL`)
- [ ] Response types match TypeScript interfaces
- [ ] Optimistic updates implemented where appropriate

### Testing Quality Gates

#### Manual Testing Requirements
- [ ] Happy path functionality verified
- [ ] Error scenarios tested (network failures, validation errors)
- [ ] Mobile/iPad functionality verified
- [ ] Cross-browser compatibility checked (Safari, Chrome)
- [ ] Performance tested with realistic data volumes

#### User Acceptance Testing
- [ ] Feature workflow tested by stakeholders
- [ ] Business logic validation completed
- [ ] Data integrity verified
- [ ] User experience meets requirements
- [ ] Documentation updated for end users

### Pre-Production Checklist
- [ ] All quality gates passed
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Deployment plan verified

## Development Environment Setup

### Required Tools
- **Node.js 18+** - Runtime environment
- **npm** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - IDE with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

### Environment Configuration
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev

# Run type checking
npx tsc --noEmit

# Run linting
npm run lint
```

## Git Workflow

### Branch Naming Convention
- **Feature branches**: `feature/contact-form-validation`
- **Bug fix branches**: `fix/dashboard-loading-error`
- **Hotfix branches**: `hotfix/security-patch`
- **Documentation**: `docs/api-documentation-update`

### Commit Message Format
Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build system or auxiliary tool changes

**Examples:**
```
feat(contacts): add contact form validation

- Add Yup schema validation for contact forms
- Implement real-time validation feedback
- Add unit tests for validation logic

Closes #123
```

### Pull Request Process

#### 1. Create Feature Branch
```bash
git checkout -b feature/contact-form-validation
git push -u origin feature/contact-form-validation
```

#### 2. Development Work
- Make incremental commits with clear messages
- Push changes regularly to backup work
- Keep PR scope focused and reviewable

#### 3. Pre-PR Checklist
- [ ] All quality gates passed locally
- [ ] Code reviewed personally for obvious issues
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

#### 4. Create Pull Request
**PR Template:**
```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing Checklist
- [ ] Manual testing completed
- [ ] Mobile/iPad testing completed
- [ ] Error scenarios tested
- [ ] Performance impact assessed

## Quality Gates
- [ ] TypeScript compilation passes
- [ ] ESLint validation passes
- [ ] All tests pass
- [ ] Code coverage maintained

## Screenshots (if applicable)
[Include screenshots for UI changes]

## Additional Notes
[Any additional context or considerations]
```

#### 5. Code Review Process
- **Required Reviewers**: At least one team member
- **Review Checklist**:
  - Code follows established patterns
  - Business logic is correct
  - Error handling is comprehensive
  - Performance considerations addressed
  - Security implications considered

#### 6. Merge Requirements
- [ ] All review comments addressed
- [ ] CI/CD pipeline passes
- [ ] Branch is up to date with main
- [ ] No merge conflicts exist

## Code Review Standards

### What to Look For

#### Code Quality
- **Readability**: Code is self-documenting and clear
- **Consistency**: Follows established patterns and conventions
- **Performance**: No obvious performance issues
- **Security**: No security vulnerabilities introduced

#### Business Logic
- **Correctness**: Logic correctly implements requirements
- **Edge Cases**: Proper handling of edge cases and errors
- **Data Validation**: Proper validation of inputs and outputs
- **User Experience**: Changes improve or maintain UX quality

#### Technical Implementation
- **Architecture**: Changes fit within existing architecture
- **Dependencies**: No unnecessary dependencies added
- **Testing**: Adequate test coverage for changes
- **Documentation**: Code changes are properly documented

### Review Checklist Template

```markdown
## Code Quality Review
- [ ] Code is readable and well-organized
- [ ] Follows TypeScript and React best practices
- [ ] No obvious performance issues
- [ ] Error handling is comprehensive
- [ ] No security vulnerabilities

## Business Logic Review
- [ ] Correctly implements requirements
- [ ] Handles edge cases appropriately
- [ ] Data validation is proper
- [ ] User experience is maintained/improved

## Technical Review
- [ ] Fits within existing architecture
- [ ] No unnecessary dependencies
- [ ] Tests are adequate
- [ ] Documentation is updated
```

## Release Process

### Version Management
The project uses semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow

#### 1. Pre-Release Preparation
- [ ] All features for release are merged to main
- [ ] Full regression testing completed
- [ ] Performance benchmarks verified
- [ ] Documentation updated
- [ ] Release notes prepared

#### 2. Release Creation
```bash
# Update version
npm version minor  # or patch/major

# Create release branch
git checkout -b release/v1.2.0
git push origin release/v1.2.0

# Create GitHub release
gh release create v1.2.0 --generate-notes
```

#### 3. Production Deployment
- [ ] Deploy to staging environment
- [ ] Staging validation completed
- [ ] Deploy to production environment
- [ ] Production health checks pass
- [ ] Monitor for issues in first 24 hours

#### 4. Post-Release
- [ ] Performance metrics reviewed
- [ ] Error rates monitored
- [ ] User feedback collected
- [ ] Hotfixes applied if necessary

## Troubleshooting Common Issues

### Development Environment Issues

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Restart TypeScript service in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"

# Verify TypeScript configuration
npx tsc --showConfig
```

#### Build Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check for circular dependencies
npm run build -- --bundleAnalyzer
```

#### Database Connection Issues
- Verify Supabase URL and keys in `.env.local`
- Check network connectivity to Supabase
- Verify RLS policies allow operations
- Check browser network tab for API errors

### Performance Issues

#### Slow Page Load
- Check bundle size with `npm run build -- --analyze`
- Verify images are optimized
- Check for unnecessary re-renders with React DevTools
- Monitor network requests for slow API calls

#### Database Query Performance
```sql
-- Check slow queries
EXPLAIN ANALYZE SELECT ...;

-- Monitor query performance
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC;
```

### Production Issues

#### Deployment Failures
- Check Vercel build logs
- Verify environment variables are set
- Check for build errors in CI/CD pipeline
- Verify Supabase connection from production

#### Runtime Errors
- Check browser console for client-side errors
- Review Supabase logs for server-side errors
- Monitor error tracking service (if configured)
- Check network requests for failed API calls

## Development Best Practices

### Daily Workflow
1. **Start of Day**: Pull latest changes from main
2. **Feature Work**: Create feature branch, implement incrementally
3. **Regular Commits**: Commit working changes frequently
4. **End of Day**: Push work to backup, run quality checks
5. **PR Creation**: Only when feature is complete and tested

### Code Organization
- Keep components small and focused (< 200 lines)
- Use consistent file naming conventions
- Group related functionality together
- Implement proper separation of concerns

### Testing Strategy
- Write unit tests for complex business logic
- Test form validation thoroughly
- Verify mobile responsiveness on actual devices
- Performance test with realistic data volumes

### Documentation Maintenance
- Update technical documentation with code changes
- Keep API documentation current
- Document architectural decisions
- Maintain troubleshooting guides

This workflow ensures high-quality, maintainable code while supporting rapid feature development for the KitchenPantry CRM system.