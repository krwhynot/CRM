# Detailed Setup Guide
*Complete environment setup for KitchenPantry CRM*

## Prerequisites

### Required Software
- **Node.js 18 or higher** - [Download from nodejs.org](https://nodejs.org/)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Modern Browser** - Chrome 90+, Firefox 88+, Safari 14+
- **Code Editor** - VS Code recommended with extensions

### Required Accounts
- **GitHub Account** - For repository access
- **Supabase Account** - For database and authentication
- **Vercel Account** (optional) - For deployment

## Step-by-Step Installation

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/krwhynot/CRM.git
cd CRM

# Verify you're on the main branch
git branch
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected output should show all dependencies without errors or vulnerabilities.

### 3. Environment Configuration

#### Create Environment File
```bash
# Copy the example environment file
cp .env.example .env.local
```

#### Configure Supabase Connection
Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Environment Settings
NODE_ENV=development
VITE_APP_ENV=development
```

**Where to find your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and log in
2. Navigate to your project dashboard
3. Click "Settings" → "API"
4. Copy the "Project URL" and "anon/public" key

### 4. Database Setup

#### Option A: Use Existing Production Database
If you have access to the production database:
```bash
# No additional setup required
# The database schema is already configured
```

#### Option B: Create New Supabase Project
1. **Create New Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and region
   - Set database password

2. **Apply Database Schema**:
   ```bash
   # Apply the full database schema
   # (Database migration files are in the docs/ directory)
   ```

3. **Configure Row Level Security**:
   - Enable RLS on all tables
   - Apply the security policies from the technical documentation

### 5. Development Server

#### Start Development Server
```bash
# Start the development server
npm run dev
```

The application should now be running at `http://localhost:5173`

#### Verify Installation
1. **Application Loads**: Browser shows the CRM interface
2. **Authentication Works**: Can access login/signup functionality
3. **Database Connection**: Can view organizations, contacts, etc.
4. **No Console Errors**: Browser console shows no critical errors

### 6. Development Tools Setup

#### VS Code Extensions (Recommended)
Install these extensions for the best development experience:

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

#### VS Code Settings
Add these settings to your workspace:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Verification Checklist

### ✅ Environment Verification
Run these commands to verify your setup:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify TypeScript compilation
npx tsc --noEmit

# Verify linting configuration
npm run lint

# Run type checking
npm run build
```

### ✅ Application Verification
1. **Homepage Loads**: `http://localhost:5173` displays correctly
2. **Authentication**: Can access login page
3. **Navigation**: All menu items are accessible
4. **Data Loading**: Organizations and contacts load (if database configured)
5. **Forms Work**: Can create/edit entities
6. **Mobile Responsive**: Works on mobile viewport

### ✅ Development Workflow Verification
```bash
# Create a test branch
git checkout -b test/setup-verification

# Make a small change (add a comment to a file)
echo "// Setup verification test" >> src/App.tsx

# Verify git workflow
git add .
git commit -m "test: setup verification"

# Switch back to main and clean up
git checkout main
git branch -D test/setup-verification
```

## Troubleshooting Common Issues

### Node.js Issues
**Problem**: "Node.js version too old"
```bash
# Solution: Install Node.js 18+ from nodejs.org
# Or use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

### Dependency Installation Issues
**Problem**: npm install fails with errors
```bash
# Solution: Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Environment Variable Issues
**Problem**: "Supabase connection failed"
- Verify `.env.local` exists and has correct values
- Check Supabase URL format: `https://project-id.supabase.co`
- Verify anon key is complete (very long string)
- Restart development server after changing env vars

### Port Already in Use
**Problem**: "Port 5173 is already in use"
```bash
# Solution: Kill the process or use different port
lsof -ti:5173 | xargs kill -9
# Or specify different port
npm run dev -- --port 3000
```

### TypeScript Compilation Errors
**Problem**: TypeScript errors on startup
```bash
# Solution: Restart TypeScript service
# In VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or check configuration
npx tsc --showConfig
```

### Database Connection Issues
**Problem**: Cannot connect to Supabase
1. Verify internet connection
2. Check Supabase project status (not paused)
3. Verify API keys are correct
4. Check browser network tab for 401/403 errors
5. Verify RLS policies allow access

### Build Issues
**Problem**: Build fails with errors
```bash
# Solution: Clean build and dependencies
rm -rf dist
npm run build

# If still failing, try clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Performance Issues
**Problem**: Development server is slow
- Check if running on battery (Mac) - plug in for better performance
- Close unnecessary browser tabs
- Check for antivirus interference
- Consider using `npm run dev -- --host` for network access

## Next Steps

After completing setup:

1. **Read the Documentation**:
   - [User Guide](../USER_GUIDE.md) - Understanding the CRM features
   - [Technical Guide](../TECHNICAL_GUIDE.md) - Architecture and APIs
   - [Development Workflow](../guides/development-workflow.md) - Daily development process

2. **Explore the Codebase**:
   - Review the project structure
   - Look at existing components in `src/components/`
   - Understand the feature organization in `src/`

3. **Make Your First Contribution**:
   - Find a "good first issue" in the repository
   - Follow the [Contributing Guide](../../CONTRIBUTING.md)
   - Submit your first pull request

4. **Join the Team**:
   - Participate in code reviews
   - Share feedback and suggestions
   - Help improve the documentation

## Support

If you encounter issues during setup:

1. **Check Documentation**: Review this guide and the troubleshooting section
2. **Search Issues**: Look for similar issues in the GitHub repository
3. **Create Issue**: If problem persists, create a detailed issue report
4. **Ask for Help**: Reach out to the development team

Remember: A successful setup should result in a running application with no critical errors in the browser console.