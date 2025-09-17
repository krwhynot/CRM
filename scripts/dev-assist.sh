#!/bin/bash

# CRM Development Assistant - Consolidated Development Utilities
# Handles setup, health checks, and auto-fixing development issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get script directory for relative paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

show_help() {
    echo -e "${BOLD}CRM Development Assistant${NC}"
    echo "========================="
    echo ""
    echo "Usage: ./scripts/dev-assist.sh [ACTION]"
    echo ""
    echo "Actions:"
    echo "  setup               Set up development environment"
    echo "  health              Check development environment health"
    echo "  fix                 Auto-fix common development issues"
    echo "  analyze             Analyze codebase health (uses Node.js assistant)"
    echo "  create              Create components/features (uses Node.js assistant)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev-assist.sh setup    # Complete dev environment setup"
    echo "  ./scripts/dev-assist.sh health   # Check environment health"
    echo "  ./scripts/dev-assist.sh fix      # Auto-fix common issues"
    echo ""
    echo "Advanced Usage (via Node.js assistant):"
    echo "  npm run dev:assist analyze             # Codebase health analysis"
    echo "  npm run dev:assist create component UserCard contacts"
    echo "  npm run dev:assist create feature notifications"
    echo ""
}

# Development environment setup
setup_dev_environment() {
    echo -e "${BOLD}🚀 CRM Development Environment Setup${NC}"
    echo "===================================="

    # Check if dev-setup.sh exists and run it
    if [ -f "$SCRIPT_DIR/dev-setup.sh" ]; then
        echo -e "${BLUE}📋 Running comprehensive development setup...${NC}"
        "$SCRIPT_DIR/dev-setup.sh"
    else
        echo -e "${BLUE}📋 Running basic development setup...${NC}"
        basic_setup
    fi

    echo -e "${GREEN}✅ Development setup complete${NC}"
    echo -e "${BLUE}💡 Run './scripts/dev-assist.sh health' to verify setup${NC}"
}

# Basic setup if dev-setup.sh doesn't exist
basic_setup() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"

    # Install npm dependencies
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        npm install
    else
        echo "Dependencies already installed"
    fi

    # Create necessary directories
    mkdir -p reports
    mkdir -p coverage
    mkdir -p .vscode

    echo -e "${GREEN}✅ Basic setup complete${NC}"
}

# Check development environment health
check_dev_health() {
    echo -e "${BOLD}🏥 Development Environment Health Check${NC}"
    echo "======================================"
    echo ""

    local health_score=0
    local total_checks=7

    # Check Node.js and npm versions
    echo -e "${BLUE}📋 System Requirements:${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "  Node.js: ${NODE_VERSION}"
        health_score=$((health_score + 1))
    else
        echo -e "  Node.js: ${RED}❌ Not found${NC}"
    fi

    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "  npm: ${NPM_VERSION}"
        health_score=$((health_score + 1))
    else
        echo -e "  npm: ${RED}❌ Not found${NC}"
    fi

    echo ""
    echo -e "${BLUE}🔍 Code Quality Checks:${NC}"

    # TypeScript check
    echo -n "  TypeScript compilation: "
    if npm run type-check > /dev/null 2>&1; then
        echo -e "${GREEN}✅ No errors${NC}"
        health_score=$((health_score + 1))
    else
        echo -e "${RED}❌ Has errors${NC}"
        echo -e "    ${YELLOW}Run 'npm run type-check' for details${NC}"
    fi

    # ESLint check
    echo -n "  ESLint: "
    if npm run lint > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Clean${NC}"
        health_score=$((health_score + 1))
    else
        echo -e "${YELLOW}⚠️ Has issues${NC}"
        echo -e "    ${YELLOW}Run 'npm run lint' for details${NC}"
    fi

    # Build test
    echo -n "  Build process: "
    if timeout 60s npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Working${NC}"
        health_score=$((health_score + 1))

        # Check bundle size if build succeeded
        if [ -d "dist" ]; then
            BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
            echo "    Bundle size: ${BUNDLE_SIZE}"
        fi
    else
        echo -e "${RED}❌ Failing${NC}"
        echo -e "    ${YELLOW}Run 'npm run build' for details${NC}"
    fi

    echo ""
    echo -e "${BLUE}📊 Environment Status:${NC}"

    # Disk space check
    DISK_USAGE=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    echo -n "  Disk space: "
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo -e "${RED}❌ ${DISK_USAGE}% full (cleanup needed)${NC}"
    elif [ "$DISK_USAGE" -gt 80 ]; then
        echo -e "${YELLOW}⚠️ ${DISK_USAGE}% used (monitor closely)${NC}"
        health_score=$((health_score + 1))
    else
        echo -e "${GREEN}✅ ${DISK_USAGE}% used${NC}"
        health_score=$((health_score + 1))
    fi

    # Dependencies check
    echo -n "  Dependencies: "
    if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
        if npm ls > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Installed and healthy${NC}"
            health_score=$((health_score + 1))
        else
            echo -e "${YELLOW}⚠️ Some issues detected${NC}"
            echo -e "    ${YELLOW}Run 'npm install' to fix${NC}"
        fi
    else
        echo -e "${RED}❌ Missing or incomplete${NC}"
        echo -e "    ${YELLOW}Run 'npm install' to install${NC}"
    fi

    echo ""

    # Calculate and display health score
    local score_percentage=$((health_score * 100 / total_checks))
    echo -e "${BOLD}📊 Health Score: ${score_percentage}% (${health_score}/${total_checks} checks passed)${NC}"

    if [ $score_percentage -ge 90 ]; then
        echo -e "${GREEN}🎉 Excellent! Development environment is healthy${NC}"
    elif [ $score_percentage -ge 70 ]; then
        echo -e "${YELLOW}⚠️ Good, but some improvements needed${NC}"
        echo -e "${BLUE}💡 Run './scripts/dev-assist.sh fix' to auto-fix issues${NC}"
    else
        echo -e "${RED}🚨 Poor health - immediate attention required${NC}"
        echo -e "${BLUE}💡 Run './scripts/dev-assist.sh fix' to auto-fix issues${NC}"
    fi

    echo ""
    echo -e "${BLUE}🛠️ Available Actions:${NC}"
    echo "  ./scripts/dev-assist.sh fix     - Auto-fix common issues"
    echo "  npm run quality-gates           - Run comprehensive quality checks"
    echo "  ./scripts/clean.sh all          - Clean build artifacts and caches"
    echo ""

    # Return health score for scripting purposes
    return $score_percentage
}

# Auto-fix common development issues
auto_fix_issues() {
    echo -e "${BOLD}🔧 Auto-Fixing Development Issues${NC}"
    echo "================================="
    echo ""

    local fixes_applied=0

    # Fix code formatting
    echo -e "${BLUE}🎨 Fixing code formatting...${NC}"
    if npm run format > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Code formatting applied${NC}"
        fixes_applied=$((fixes_applied + 1))
    else
        echo -e "${YELLOW}⚠️ Could not fix formatting automatically${NC}"
    fi

    # Fix auto-fixable linting issues
    echo -e "${BLUE}🧹 Fixing linting issues...${NC}"
    if npm run lint -- --fix > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Auto-fixable lint issues resolved${NC}"
        fixes_applied=$((fixes_applied + 1))
    else
        echo -e "${YELLOW}⚠️ Some lint issues require manual attention${NC}"
        echo -e "    ${BLUE}Run 'npm run lint' to see remaining issues${NC}"
    fi

    # Clear caches
    echo -e "${BLUE}🧽 Clearing caches and temporary files...${NC}"

    # Clear npm cache
    npm cache clean --force > /dev/null 2>&1 || true

    # Remove temporary files
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "*.log" -type f -delete 2>/dev/null || true

    echo -e "${GREEN}✅ Caches and temporary files cleared${NC}"
    fixes_applied=$((fixes_applied + 1))

    # Fix dependencies if needed
    echo -e "${BLUE}📦 Checking dependencies...${NC}"
    if ! npm ls > /dev/null 2>&1; then
        echo "Reinstalling dependencies..."
        if npm install > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Dependencies reinstalled${NC}"
            fixes_applied=$((fixes_applied + 1))
        else
            echo -e "${YELLOW}⚠️ Could not fix dependency issues${NC}"
        fi
    else
        echo -e "${GREEN}✅ Dependencies are healthy${NC}"
    fi

    # TypeScript build info cleanup
    echo -e "${BLUE}🔄 Cleaning TypeScript build cache...${NC}"
    rm -f *.tsbuildinfo tsconfig.tsbuildinfo 2>/dev/null || true
    echo -e "${GREEN}✅ TypeScript build cache cleared${NC}"
    fixes_applied=$((fixes_applied + 1))

    echo ""
    echo -e "${BOLD}📊 Fix Summary:${NC}"
    echo -e "${GREEN}✅ Applied ${fixes_applied} fixes${NC}"
    echo ""

    if [ $fixes_applied -gt 0 ]; then
        echo -e "${BLUE}💡 Next steps:${NC}"
        echo "  1. Run './scripts/dev-assist.sh health' to verify fixes"
        echo "  2. Run 'npm run quality-gates' for comprehensive validation"
        echo "  3. Test your development workflow"
        echo ""
    fi

    echo -e "${GREEN}🎉 Auto-fix complete!${NC}"
}

# Analyze codebase (delegates to Node.js assistant)
analyze_codebase() {
    echo -e "${BLUE}🔍 Running codebase analysis...${NC}"
    echo "(Delegating to Node.js development assistant)"
    echo ""

    if [ -f "$SCRIPT_DIR/dev-assistant.js" ]; then
        node "$SCRIPT_DIR/dev-assistant.js" analyze
    else
        echo -e "${RED}❌ Node.js development assistant not found${NC}"
        echo "Expected: $SCRIPT_DIR/dev-assistant.js"
    fi
}

# Create components (delegates to Node.js assistant)
create_component() {
    echo -e "${BLUE}🏗️ Creating component...${NC}"
    echo "(Delegating to Node.js development assistant)"
    echo ""

    if [ -f "$SCRIPT_DIR/dev-assistant.js" ]; then
        node "$SCRIPT_DIR/dev-assistant.js" "$@"
    else
        echo -e "${RED}❌ Node.js development assistant not found${NC}"
        echo "Expected: $SCRIPT_DIR/dev-assistant.js"
        echo ""
        echo "For component creation, use:"
        echo "  npm run dev:assist create component ComponentName featureName"
    fi
}

# Main execution
main() {
    local action="${1:-help}"

    case "$action" in
        "setup")
            setup_dev_environment
            ;;
        "health")
            check_dev_health
            ;;
        "fix")
            auto_fix_issues
            ;;
        "analyze")
            analyze_codebase
            ;;
        "create")
            create_component "$@"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            # For backward compatibility, if first arg doesn't match actions,
            # try to delegate to Node.js assistant for component creation
            if [ -f "$SCRIPT_DIR/dev-assistant.js" ]; then
                node "$SCRIPT_DIR/dev-assistant.js" "$@"
            else
                echo -e "${RED}❌ Unknown action: $action${NC}"
                echo ""
                show_help
                exit 1
            fi
            ;;
    esac
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi