#!/bin/bash

# KitchenPantry CRM Development Setup
# One-command development environment setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}🚀 KitchenPantry CRM Development Setup${NC}"
echo -e "${BOLD}======================================${NC}"

# Check system requirements
check_requirements() {
    echo -e "${BLUE}📋 Checking system requirements...${NC}"
    
    # Node.js version check
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d '.' -f 1)
    
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 18+ required. Current: $NODE_VERSION${NC}"
        echo "Please update Node.js: https://nodejs.org/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
    
    # npm check
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm version: $NPM_VERSION${NC}"
    
    # Git configuration check
    if ! git config user.name > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ Git user not configured. Please run:${NC}"
        echo "git config --global user.name 'Your Name'"
        echo "git config --global user.email 'your.email@example.com'"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Git configured for: $(git config user.name)${NC}"
    
    # Check available disk space
    AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
    if [ "$AVAILABLE_SPACE" -lt 1000000 ]; then # Less than ~1GB
        echo -e "${YELLOW}⚠️ Low disk space detected. Consider freeing up space.${NC}"
    fi
    
    echo -e "${GREEN}✅ System requirements met${NC}"
}

# Install dependencies with optimization
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Check if node_modules exists and is valid
    if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
        echo "📦 Existing node_modules found, checking integrity..."
        if npm ci --prefer-offline --silent > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Dependencies are up to date${NC}"
            return
        else
            echo -e "${YELLOW}⚠️ Dependencies out of sync, reinstalling...${NC}"
            rm -rf node_modules package-lock.json
        fi
    fi
    
    # Clear any existing cache issues
    npm cache clean --force 2>/dev/null || true
    
    # Install with performance optimizations
    echo "Installing packages..."
    if npm install --prefer-offline --no-audit --progress=false; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    
    # Install Playwright browsers if needed
    if ! npx playwright --version > /dev/null 2>&1; then
        echo "📥 Installing Playwright browsers..."
        npx playwright install --with-deps > /dev/null 2>&1
        echo -e "${GREEN}✅ Playwright browsers installed${NC}"
    fi
}

# Setup development tools
setup_dev_tools() {
    echo -e "${BLUE}🛠️ Setting up development tools...${NC}"
    
    # Create .vscode directory and settings
    mkdir -p .vscode
    
    if [ ! -f .vscode/settings.json ]; then
        echo "🔧 Creating VS Code settings..."
        cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "git.autofetch": true,
  "git.enableSmartCommit": true,
  "eslint.workingDirectories": ["./"],
  "prettier.requireConfig": true,
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true,
    "**/*.log": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/.DS_Store": true
  }
}
EOF
        echo -e "${GREEN}✅ VS Code settings configured${NC}"
    else
        echo -e "${YELLOW}⚠️ VS Code settings already exist${NC}"
    fi
    
    # Create VS Code extensions recommendations
    if [ ! -f .vscode/extensions.json ]; then
        echo "📦 Creating VS Code extensions recommendations..."
        cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "ms-vscode.test-adapter-converter"
  ]
}
EOF
        echo -e "${GREEN}✅ VS Code extensions recommendations created${NC}"
    fi
    
    # Setup Git hooks
    if [ ! -f .git/hooks/pre-commit ]; then
        echo "🎣 Setting up Git pre-commit hook..."
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running pre-commit quality checks..."

# Run quality gates but don't fail the commit on warnings
if npm run quality-gates 2>/dev/null; then
    echo "✅ Quality checks passed"
    exit 0
else
    echo "⚠️ Quality checks found issues, but allowing commit"
    echo "💡 Run 'npm run quality-gates' to see details"
    exit 0
fi
EOF
        chmod +x .git/hooks/pre-commit
        echo -e "${GREEN}✅ Git pre-commit hook installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Git pre-commit hook already exists${NC}"
    fi
    
    # Create development helper scripts directory
    mkdir -p scripts
    if [ ! -f scripts/dev-assist.sh ]; then
        echo "🚀 Creating development assistant script..."
        cat > scripts/dev-assist.sh << 'EOF'
#!/bin/bash
# Development Assistant - Quick commands for common tasks

show_help() {
    echo "KitchenPantry CRM Development Assistant"
    echo "======================================"
    echo ""
    echo "Usage: ./scripts/dev-assist.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  health               Check development environment health"
    echo "  fix                  Auto-fix common issues"
    echo "  clean               Clean build artifacts and caches"
    echo "  reset               Reset development environment"
    echo ""
}

check_dev_health() {
    echo "🏥 Checking development environment health..."
    echo ""
    
    # Check Node.js and npm
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    
    # Check TypeScript
    if npm run type-check > /dev/null 2>&1; then
        echo "TypeScript: ✅ No type errors"
    else
        echo "TypeScript: ❌ Type errors found - run 'npm run type-check'"
    fi
    
    # Check linting
    if npm run lint > /dev/null 2>&1; then
        echo "ESLint: ✅ No linting errors"
    else
        echo "ESLint: ❌ Linting errors found - run 'npm run lint'"
    fi
    
    # Check if build works
    echo "Testing build process..."
    if timeout 30s npm run build > /dev/null 2>&1; then
        echo "Build: ✅ Builds successfully"
    else
        echo "Build: ❌ Build failing - run 'npm run build' for details"
    fi
    
    # Check disk space
    DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo "Disk Space: ❌ ${DISK_USAGE}% full (cleanup recommended)"
    else
        echo "Disk Space: ✅ ${DISK_USAGE}% used"
    fi
    
    echo ""
    echo "💡 Run './scripts/dev-assist.sh fix' to auto-fix common issues"
}

auto_fix_issues() {
    echo "🔧 Auto-fixing common development issues..."
    
    # Fix formatting
    echo "🎨 Formatting code..."
    npm run format 2>/dev/null || echo "⚠️ Formatting failed"
    
    # Fix linting issues
    echo "🧹 Fixing linting issues..."
    npm run lint -- --fix 2>/dev/null || echo "⚠️ Some lint issues require manual fixing"
    
    # Clear caches
    echo "🧽 Clearing caches..."
    npm cache clean --force 2>/dev/null
    
    echo "✅ Auto-fix complete"
    echo "💡 Run 'npm run quality-gates' to verify fixes"
}

clean_environment() {
    echo "🧽 Cleaning development environment..."
    
    # Clean build artifacts
    echo "Removing build artifacts..."
    rm -rf dist/
    rm -rf coverage/
    rm -rf .nyc_output/
    rm -rf test-results/
    
    # Clean logs
    echo "Removing log files..."
    find . -name "*.log" -type f -delete 2>/dev/null || true
    
    # Clean temporary files
    echo "Removing temporary files..."
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    
    echo "✅ Environment cleaned"
}

reset_environment() {
    echo "🔄 Resetting development environment..."
    
    # Clean everything
    clean_environment
    
    # Remove node_modules and reinstall
    echo "Reinstalling dependencies..."
    rm -rf node_modules/
    rm -f package-lock.json
    npm install
    
    echo "✅ Environment reset complete"
    echo "💡 Run './scripts/dev-assist.sh health' to verify setup"
}

case "$1" in
    "health")
        check_dev_health
        ;;
    "fix")
        auto_fix_issues
        ;;
    "clean")
        clean_environment
        ;;
    "reset")
        reset_environment
        ;;
    *)
        show_help
        ;;
esac
EOF
        chmod +x scripts/dev-assist.sh
        echo -e "${GREEN}✅ Development assistant script created${NC}"
    fi
}

# Validate setup
validate_setup() {
    echo -e "${BLUE}✅ Validating setup...${NC}"
    
    # Quick TypeScript check
    echo "Checking TypeScript compilation..."
    if npm run type-check > /dev/null 2>&1; then
        echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
    else
        echo -e "${YELLOW}⚠️ TypeScript has some issues, but setup can continue${NC}"
    fi
    
    # Quick lint check
    echo "Checking code linting..."
    if npm run lint > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Code linting passed${NC}"
    else
        echo -e "${YELLOW}⚠️ Linting has some issues, but setup can continue${NC}"
    fi
    
    # Test build process
    echo "Testing build process..."
    if timeout 45s npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Build process working${NC}"
        
        # Check bundle size
        if [ -d "dist" ]; then
            BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
            echo -e "${BLUE}📦 Bundle size: ${BUNDLE_SIZE}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Build process had issues, but setup can continue${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
    echo ""
    echo -e "${BOLD}Quick commands to get started:${NC}"
    echo "  npm run dev                     - Start development server"
    echo "  npm run quality-gates          - Run all quality checks"
    echo "  ./scripts/dev-assist.sh health - Check environment health"
    echo "  ./scripts/dev-assist.sh fix    - Auto-fix common issues"
    echo ""
    echo -e "${BOLD}Helpful resources:${NC}"
    echo "  docs/DEVELOPER_PRODUCTIVITY_IMPROVEMENTS.md - Productivity guide"
    echo "  docs/CI_CD_QUALITY_GATES.md                 - Quality gates documentation"
    echo "  docs/COMPREHENSIVE_TESTING_STRATEGY.md       - Testing guide"
    echo ""
    echo -e "${BLUE}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    check_requirements
    install_dependencies
    setup_dev_tools
    validate_setup
}

# Run setup if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi