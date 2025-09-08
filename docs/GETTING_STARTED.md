# Getting Started with KitchenPantry CRM

Welcome to KitchenPantry CRM - a comprehensive customer relationship management system built specifically for Master Food Brokers in the food service industry.

## Quick Start

### Prerequisites
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Supabase Account** - [Create at supabase.com](https://supabase.com)
- **Modern Browser** - Chrome 90+, Firefox 88+, Safari 14+

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/krwhynot/CRM.git
cd CRM

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev
```

The application will be running at `http://localhost:5173`

## Environment Configuration

### Required Environment Variables

Create `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
NODE_ENV=development
```

**Where to find Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Settings → API
3. Copy "Project URL" and "anon/public" key

### Database Setup Options

#### Option A: Use Production Database
If you have access to the production database, no additional setup is required.

#### Option B: Create New Supabase Project
1. Create new project at [supabase.com](https://supabase.com)
2. Apply database schema (see [Database Documentation](database/))
3. Configure Row Level Security policies
4. Update `.env.local` with new project credentials

## Development Environment Setup

### VS Code (Recommended)

Install these extensions for the best experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss", 
    "dsznajder.es7-react-js-snippets",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Workspace Settings

Add to VS Code workspace settings:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript", 
    "typescriptreact": "javascript"
  }
}
```

## Verification Checklist

Run these commands to verify your setup:

```bash
# Check Node.js version (should be 18+)
node --version

# Verify TypeScript compilation
npx tsc --noEmit

# Check linting
npm run lint

# Test build
npm run build

# Start development server
npm run dev
```

### Application Verification
- ✅ Homepage loads at `http://localhost:5173`
- ✅ Authentication system accessible
- ✅ Navigation menu works
- ✅ Data loads (organizations, contacts, etc.)
- ✅ Forms functional (create/edit entities)
- ✅ Mobile responsive design works

## Your First Contribution

### Finding Good First Issues

Look for GitHub issues labeled:
- `good first issue` - Beginner-friendly
- `documentation` - Documentation improvements
- `bug` + `low priority` - Simple fixes
- `enhancement` + `small` - Minor features

### Contribution Process

1. **Choose an Issue**: Comment to claim it
2. **Create Branch**: 
   ```bash
   git checkout -b fix/your-issue-name
   ```
3. **Make Changes**: Follow existing code patterns
4. **Test Thoroughly**: Run quality checks
5. **Create Pull Request**: Use the provided template
6. **Respond to Review**: Address feedback promptly

### Quality Gates

Before submitting any PR:

```bash
# TypeScript compilation
npx tsc --noEmit

# Linting 
npm run lint

# Build test
npm run build

# Full validation pipeline
npm run validate
```

## Troubleshooting Common Issues

### Node.js Issues

**"Node version too old"**
```bash
# Install Node.js 18+ from nodejs.org
# Or use nvm:
nvm install 18
nvm use 18
```

**"npm install fails"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Environment Issues

**"Cannot connect to Supabase"**
1. Check `.env.local` exists with correct variables
2. Verify Supabase URL format: `https://project-id.supabase.co`
3. Confirm anon key is complete (starts with `eyJ`)
4. Restart development server after env changes

**"Environment variables not loading"**
1. File must be named `.env.local` (not `.env`)
2. Variables must start with `VITE_`
3. Restart development server
4. Check file contents for typos

### Development Server Issues

**"Port 5173 already in use"**
```bash
# Kill process using port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**"Development server won't start"**
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm install
npm run dev
```

### TypeScript Issues

**"Cannot find module '@/components/...'"**
1. Check `vite.config.ts` has correct path aliases
2. Restart TypeScript service in VS Code
3. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache
   ```

**"Build fails with TypeScript errors"**
```bash
# Check for errors
npx tsc --noEmit

# Clear build cache
rm -rf dist
npm run build
```

### Database Issues

**"Supabase RLS error"**
1. Ensure you're logged into the app
2. Check RLS policies in Supabase dashboard
3. Verify user permissions

**"Database schema mismatch"**
1. Check tables exist in Supabase dashboard
2. Apply any missing migrations
3. Regenerate TypeScript types if needed

### Browser Issues

**"CORS errors"**
1. Verify correct Supabase URL (no trailing slash)
2. Clear browser cache (Cmd/Ctrl + Shift + R)
3. Try incognito mode to rule out extensions

**"Network request failed"**
1. Check internet connection
2. Verify Supabase project is not paused
3. Try different network if on corporate WiFi

### Mobile/iPad Issues

**"App doesn't work on iPad"**
1. Use browser dev tools mobile simulation
2. Test actual breakpoints and touch targets
3. Check iOS Safari compatibility

**"Performance issues on mobile"**
```bash
# Check bundle size
npm run build

# Test on local network
npm run dev -- --host
# Access from mobile using computer's IP
```

## Advanced Setup

### Debug Mode
Add to your components for development debugging:

```typescript
// Add to src/lib/debug.ts
export const DEBUG = {
  SUPABASE: process.env.NODE_ENV === 'development',
  REACT_QUERY: process.env.NODE_ENV === 'development',
  PERFORMANCE: process.env.NODE_ENV === 'development',
}

// Use in components
if (DEBUG.SUPABASE) {
  console.log('Supabase query:', query)
}
```

### Performance Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Performance validation
npm run validate:performance

# Memory leak detection
# Use browser dev tools: Memory tab → Take heap snapshot
```

### Network Debugging
```bash
# Test Supabase connection directly
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/organizations?select=*&limit=1"
```

## Getting Help

### When to Ask for Help
- You've tried multiple solutions from this guide
- Error persists after clean installation  
- Issue affects core functionality
- Error messages are unclear

### How to Ask Effectively

Include this information:
1. **Environment details**: Node/npm versions, OS, browser
2. **Complete error message**: Full stack traces
3. **Steps to reproduce**: Exact steps and expected vs actual behavior
4. **What you've tried**: List attempted solutions

### Where to Get Help
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general help
- **Documentation** - Check other guides in `docs/`
- **Code Comments** - Inline documentation in source

## Next Steps

After completing setup:

1. **Explore the Codebase**:
   - Review project structure in `src/`
   - Look at existing components
   - Understand feature organization

2. **Read Core Documentation**:
   - [User Guide](USER_GUIDE.md) - Understanding CRM features
   - [Architecture Guide](ARCHITECTURE.md) - System design
   - [Development Guide](DEVELOPMENT_GUIDE.md) - Coding standards

3. **Make Your First Contribution**:
   - Find a "good first issue"
   - Follow the contribution process above
   - Join code reviews and discussions

4. **Join the Community**:
   - Help other new contributors
   - Suggest improvements
   - Share feedback and learnings

## Emergency Reset

If you need to start completely fresh:

```bash
# Nuclear option: Complete clean setup
cd ..
rm -rf CRM
git clone https://github.com/krwhynot/CRM.git  
cd CRM
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

Remember: Most issues have simple solutions. Start with basics (restart, clean install, check environment) before complex debugging.

---

*Welcome to the KitchenPantry CRM development team! This getting started guide will be continuously updated based on your feedback and experiences.*