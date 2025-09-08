# Setup Troubleshooting Guide
*Common setup issues and solutions for KitchenPantry CRM*

## Quick Diagnostics

If you're experiencing issues, run these commands first:

```bash
# Check versions
node --version     # Should be 18.0.0 or higher
npm --version      # Should be 8.0.0 or higher

# Check environment
cat .env.local     # Should contain VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Test build
npm run build      # Should complete without errors

# Test TypeScript
npx tsc --noEmit   # Should show no errors
```

## Common Issues and Solutions

### Node.js and npm Issues

#### Issue: "Node version too old"
```
Error: The engine "node" is incompatible with this module.
```

**Solution:**
```bash
# Option 1: Install Node.js 18+ from nodejs.org
# Download and install from https://nodejs.org/

# Option 2: Use Node Version Manager (macOS/Linux)
# Install nvm first: https://github.com/nvm-sh/nvm
nvm install 18
nvm use 18
nvm alias default 18

# Option 3: Use Node Version Manager (Windows)
# Install nvm-windows: https://github.com/coreybutler/nvm-windows
nvm install 18.17.0
nvm use 18.17.0
```

#### Issue: "npm install fails"
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clear npm cache and start fresh
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps

# For persistent issues, try yarn instead
npm install -g yarn
yarn install
```

#### Issue: "Command not found: npm"
**Solution:**
- Node.js installation didn't include npm
- Reinstall Node.js from nodejs.org
- Verify installation: `which node` and `which npm`

### Environment Configuration Issues

#### Issue: "Cannot connect to Supabase"
```
Error: Invalid API key
```

**Solutions:**
1. **Check .env.local exists:**
   ```bash
   ls -la .env.local
   # Should show the file exists
   ```

2. **Verify environment variables:**
   ```bash
   cat .env.local
   # Should show VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   ```

3. **Check Supabase credentials:**
   - URL format: `https://project-id.supabase.co`
   - Anon key: Very long string starting with `eyJ`
   - Get from Supabase dashboard → Settings → API

4. **Restart development server:**
   ```bash
   # Environment changes require restart
   npm run dev
   ```

#### Issue: "Environment variables not loading"
```
console.log(import.meta.env.VITE_SUPABASE_URL) // undefined
```

**Solutions:**
1. **Check file name:** Must be `.env.local` (not `.env`)
2. **Check variable names:** Must start with `VITE_`
3. **Restart dev server:** Environment changes require restart
4. **Check file contents:**
   ```bash
   # Should look like this:
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
   ```

### Development Server Issues

#### Issue: "Port 5173 already in use"
```
Error: Port 5173 is already in use
```

**Solutions:**
```bash
# Option 1: Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Option 2: Use a different port
npm run dev -- --port 3000

# Option 3: Find and kill the process manually
lsof -i :5173
kill -9 [PID]
```

#### Issue: "Development server won't start"
```
Error: Cannot start development server
```

**Solutions:**
1. **Check dependencies:**
   ```bash
   npm install
   ```

2. **Clear cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Check for syntax errors:**
   ```bash
   npx tsc --noEmit
   npm run lint
   ```

4. **Try clean restart:**
   ```bash
   rm -rf node_modules dist .vite
   npm install
   npm run dev
   ```

### TypeScript and Build Issues

#### Issue: "TypeScript compilation errors"
```
error TS2307: Cannot find module '@/components/ui/button'
```

**Solutions:**
1. **Check path aliases:**
   ```typescript
   // vite.config.ts should have:
   resolve: {
     alias: {
       "@": path.resolve(__dirname, "./src"),
     },
   }
   ```

2. **Restart TypeScript service:**
   - In VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

3. **Clear TypeScript cache:**
   ```bash
   rm -rf node_modules/.cache
   npx tsc --noEmit
   ```

#### Issue: "Build fails with errors"
```
Error: Build failed with 1 error
```

**Solutions:**
1. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   # Fix all errors shown
   ```

2. **Check for missing dependencies:**
   ```bash
   npm install
   ```

3. **Clear build cache:**
   ```bash
   rm -rf dist
   npm run build
   ```

### Database Connection Issues

#### Issue: "Supabase RLS error"
```
Error: Row Level Security policy violation
```

**Solutions:**
1. **Check authentication:**
   - Ensure you're logged in to the app
   - Check if session is valid in browser dev tools

2. **Verify RLS policies:**
   - Check Supabase dashboard → Authentication → Policies
   - Ensure policies allow authenticated users

3. **Check user permissions:**
   ```sql
   -- In Supabase SQL editor
   SELECT auth.uid(); -- Should return your user ID
   ```

#### Issue: "Database schema mismatch"
```
Error: relation "organizations" does not exist
```

**Solutions:**
1. **Check database setup:**
   - Verify tables exist in Supabase dashboard
   - Apply database migrations if needed

2. **Regenerate TypeScript types:**
   ```bash
   # If using Supabase CLI
   supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
   ```

### Browser and Network Issues

#### Issue: "CORS errors in browser"
```
Access to fetch has been blocked by CORS policy
```

**Solutions:**
1. **Check Supabase URL:**
   - Should be correct project URL from dashboard
   - Should not have trailing slash

2. **Clear browser cache:**
   - Hard refresh: Cmd/Ctrl + Shift + R
   - Clear cookies and site data

3. **Try incognito/private mode:**
   - Rules out browser extension interference

#### Issue: "Network request failed"
```
Error: Failed to fetch
```

**Solutions:**
1. **Check internet connection**
2. **Verify Supabase project status:**
   - Project not paused
   - No service outages
3. **Try different network:**
   - Corporate networks may block requests
   - Try mobile hotspot

### VS Code and Editor Issues

#### Issue: "IntelliSense not working"
**Solutions:**
1. **Install recommended extensions:**
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets

2. **Restart VS Code**

3. **Check workspace settings:**
   ```json
   {
     "typescript.preferences.importModuleSpecifier": "relative",
     "typescript.suggest.autoImports": true
   }
   ```

#### Issue: "Tailwind classes not showing suggestions"
**Solutions:**
1. **Install Tailwind CSS IntelliSense extension**

2. **Check VS Code settings:**
   ```json
   {
     "tailwindCSS.includeLanguages": {
       "typescript": "javascript",
       "typescriptreact": "javascript"
     }
   }
   ```

3. **Restart VS Code**

### Mobile/iPad Testing Issues

#### Issue: "App doesn't work on iPad"
**Solutions:**
1. **Check responsive design:**
   - Use browser dev tools mobile simulation
   - Test actual breakpoints

2. **Check touch interactions:**
   - Minimum 44px touch targets
   - No hover-dependent functionality

3. **Check iOS Safari compatibility:**
   - Some modern JavaScript features need polyfills
   - Test in actual Safari, not just Chrome mobile simulation

#### Issue: "Performance issues on mobile"
**Solutions:**
1. **Check bundle size:**
   ```bash
   npm run build
   # Check dist/ folder size
   ```

2. **Test on actual device:**
   ```bash
   # Serve on local network
   npm run dev -- --host
   # Access from mobile device using computer's IP
   ```

## Advanced Troubleshooting

### Debug Mode Setup
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

### Performance Debugging
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for memory leaks
# In browser dev tools: Memory tab → Take heap snapshot
```

### Network Debugging
```bash
# Test Supabase connection directly
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/organizations?select=*&limit=1"
```

## Getting Additional Help

### When to Ask for Help
- You've tried multiple solutions from this guide
- Error persists after clean installation
- Issue affects core functionality
- Error messages are unclear or undocumented

### How to Ask for Help Effectively

#### Include This Information
1. **Environment details:**
   ```bash
   node --version
   npm --version
   cat package.json | grep "name\|version"
   ```

2. **Complete error message:**
   - Full stack trace
   - Browser console errors
   - Network tab errors (if relevant)

3. **Steps to reproduce:**
   - What you were trying to do
   - Exact steps taken
   - Expected vs actual behavior

4. **What you've tried:**
   - List solutions attempted
   - Results of each attempt

#### Example Help Request
```markdown
**Environment:**
- OS: macOS 13.4
- Node: v18.17.0
- npm: 9.8.1
- Browser: Chrome 115

**Error:**
```
Error: Cannot resolve module '@/components/ui/button'
at buildStart (vite.config.ts:23:10)
```

**Steps to reproduce:**
1. Fresh clone of repository
2. npm install
3. npm run dev
4. Browser shows compilation error

**What I've tried:**
- Cleared node_modules and reinstalled
- Checked vite.config.ts path aliases (they look correct)
- Restarted VS Code and TypeScript service
- Verified the button component exists at src/components/ui/button.tsx

The error persists and I can't start the development server.
```

### Where to Get Help
1. **GitHub Issues** - For bugs and feature requests
2. **GitHub Discussions** - For questions and general help
3. **Documentation** - Check other guides in docs/
4. **Code Comments** - Inline documentation in source code

### Emergency Fixes
If you need to get running quickly:

```bash
# Nuclear option: Complete clean setup
cd ..
rm -rf CRM
git clone https://github.com/krwhynot/CRM.git
cd CRM
npm install
cp .env.example .env.local
# Edit .env.local with credentials
npm run dev
```

Remember: Most issues have simple solutions. Start with the basics (restart, clean install, check environment) before moving to complex debugging.