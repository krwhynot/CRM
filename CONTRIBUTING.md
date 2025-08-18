# Contributing to KitchenPantry CRM

## 🎯 Quick Contribution Path
1. Find an issue or feature to work on
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## 📐 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Git

### Local Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/CRM.git
cd CRM

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Start development server
npm run dev
```

### IDE Configuration
**Recommended VS Code Extensions:**
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter

## 🔄 Development Workflow

### For Bug Fixes (< 2 hours)
1. Create branch: `git checkout -b fix/issue-description`
2. Make minimal changes to fix the issue
3. Test the fix thoroughly
4. Submit PR to `main` branch

### For Features (> 2 hours)
1. **Discuss first** - Open an issue to discuss the feature
2. Create branch: `git checkout -b feature/feature-name`
3. Follow existing patterns and architecture
4. Include tests for new functionality
5. Update documentation if needed
6. Submit PR with detailed description

## 📝 Code Standards

### TypeScript
- **Strict mode required** - No `any` types allowed
- **Explicit interfaces** - Define interfaces for all data structures
- **Type vs Interface** - Use `interface` for object shapes, `type` for unions/aliases
- **Naming conventions** - PascalCase for types/interfaces, camelCase for variables

```typescript
// Good
interface ContactFormData {
  firstName: string
  lastName: string
  organizationId: string
}

// Avoid
const data: any = { ... }
```

### React Components
- **Functional components** with hooks
- **Component composition** over inheritance
- **Props interfaces** for all components
- **Error boundaries** for error handling

```typescript
interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
  initialData?: Partial<ContactFormData>
  loading?: boolean
}

export function ContactForm({ onSubmit, initialData, loading }: ContactFormProps) {
  // Component implementation
}
```

### Styling (Tailwind CSS + shadcn/ui)
- **Use shadcn/ui components first** before custom styling
- **Tailwind utilities** for custom styles
- **Responsive design** - Mobile-first approach
- **Class ordering** - Follow Tailwind's recommended order

```tsx
// Good - Use shadcn/ui components
<Button variant="default" size="sm">
  Submit
</Button>

// Good - Tailwind utilities with responsive design
<div className="p-4 md:p-6 border rounded-lg">
  Content
</div>
```

### Database & API
- **Supabase patterns** - Follow existing service patterns
- **Row Level Security** - Always implement RLS policies
- **TypeScript types** - Generate types from database schema
- **Error handling** - Consistent error handling across all operations

## ✅ Pull Request Checklist

**Before submitting:**
- [ ] Code compiles without TypeScript errors (`npx tsc --noEmit`)
- [ ] Linting passes (`npm run lint`)
- [ ] All existing tests pass
- [ ] New functionality has tests (if applicable)
- [ ] Mobile responsiveness verified (iPad focus)
- [ ] Database changes include proper RLS policies
- [ ] Documentation updated if needed
- [ ] Screenshots included for UI changes

**PR Description Template:**
```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] Tested on mobile/iPad
- [ ] Database operations tested
- [ ] Error scenarios tested

## Screenshots (if applicable)
[Include screenshots for UI changes]
```

## 🚀 Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Type check without compilation |
| `npm run docs:validate` | Validate documentation |

## 🏗️ Architecture Guidelines

### Component Structure
Follow the existing patterns:
- Use shadcn/ui components as foundation
- Create feature-specific components in appropriate directories
- Implement proper TypeScript interfaces
- Handle loading and error states

### State Management
- **React Query** for server state
- **Context API** for global client state
- **Local state** with `useState` for component-specific state
- **Form state** with react-hook-form

### File Organization
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── [feature]/       # Feature-specific components
├── hooks/               # Custom React hooks
├── pages/               # Route components
├── types/               # TypeScript definitions
├── lib/                 # Utilities and configuration
└── contexts/            # React contexts
```

## 🎯 CRM-Specific Guidelines

### Entity Management
The CRM revolves around 5 core entities:
1. **Organizations** - Companies/businesses
2. **Contacts** - Individual people
3. **Products** - Items being sold
4. **Opportunities** - Sales opportunities
5. **Interactions** - Communication history

### Business Logic
- **Organizations** can be both Principals and Distributors
- **Products** can only belong to Principal organizations
- **Contacts** belong to organizations and can be marked as primary
- **Opportunities** link organizations, contacts, and products
- **Interactions** track all communication history

### Mobile-First Design
- **iPad optimization** - Primary target for field sales teams
- **Touch-friendly** - Minimum 44px touch targets
- **Portrait and landscape** - Support both orientations
- **Offline considerations** - Handle network issues gracefully

## 🔧 Troubleshooting

### Common Development Issues

**TypeScript errors:**
- Run `npx tsc --noEmit` to see all type errors
- Ensure all interfaces are properly defined
- Check import paths are correct

**Build failures:**
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for syntax errors in recent changes
- Verify environment variables are set

**Database issues:**
- Check Supabase connection in browser dev tools
- Verify RLS policies allow your operations
- Check if database schema matches TypeScript types

**Styling issues:**
- Verify Tailwind classes are spelled correctly
- Check if custom CSS is conflicting
- Ensure responsive breakpoints are appropriate

## 🤝 Getting Help

- **Architecture questions** - Check [docs/architecture/](docs/architecture/)
- **API documentation** - See [TECHNICAL_GUIDE.md](docs/TECHNICAL_GUIDE.md)
- **User workflows** - Review [USER_GUIDE.md](docs/USER_GUIDE.md)
- **Issues** - Open a GitHub issue for bugs or feature requests
- **Discussions** - Use GitHub Discussions for questions

## 🎉 Recognition

All contributors will be recognized in the project. We appreciate:
- Bug reports and fixes
- Feature suggestions and implementations
- Documentation improvements
- Code reviews and feedback
- Testing and quality assurance

Thank you for contributing to KitchenPantry CRM!