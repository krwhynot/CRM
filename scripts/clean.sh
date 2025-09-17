#!/bin/bash

# CRM Build Pipeline - Parameterized Cleanup Utility
# Supports different levels of cleanup: basic, all, fresh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BOLD}CRM Cleanup Utility${NC}"
    echo "==================="
    echo ""
    echo "Usage: ./scripts/clean.sh [LEVEL]"
    echo ""
    echo "Levels:"
    echo "  basic (default)     Remove build artifacts and temporary files"
    echo "  all                 Remove build artifacts, reports, and caches"
    echo "  fresh               Complete cleanup including node_modules"
    echo ""
    echo "Examples:"
    echo "  ./scripts/clean.sh          # Basic cleanup"
    echo "  ./scripts/clean.sh basic    # Same as above"
    echo "  ./scripts/clean.sh all      # Clean artifacts and caches"
    echo "  ./scripts/clean.sh fresh    # Full reset"
    echo ""
}

# Basic cleanup - remove build artifacts and temp files
clean_basic() {
    echo -e "${BLUE}🧽 Basic cleanup - removing build artifacts...${NC}"

    # Build outputs
    rm -rf dist/
    rm -rf coverage/
    rm -rf .nyc_output/
    rm -rf test-results/
    rm -rf playwright-report/
    rm -rf reports/

    # TypeScript build info
    rm -f *.tsbuildinfo
    rm -f tsconfig.tsbuildinfo

    # Temporary files
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "Thumbs.db" -type f -delete 2>/dev/null || true

    # Log files
    find . -name "*.log" -type f -delete 2>/dev/null || true
    find . -name "npm-debug.log*" -type f -delete 2>/dev/null || true

    echo -e "${GREEN}✅ Basic cleanup complete${NC}"
}

# All cleanup - includes caches and more thorough cleaning
clean_all() {
    echo -e "${BLUE}🧽 All cleanup - removing artifacts, reports, and caches...${NC}"

    # First do basic cleanup
    clean_basic

    # Reports and analysis
    rm -rf reports/*.json 2>/dev/null || true
    rm -rf .vite-bundle-analyzer/ 2>/dev/null || true
    rm -rf bundle-analysis/ 2>/dev/null || true

    # Vite cache
    rm -rf .vite/
    rm -rf node_modules/.vite/

    # npm/yarn caches (local only)
    rm -rf .npm/
    rm -rf node_modules/.cache/

    # Clear npm cache
    npm cache clean --force 2>/dev/null || echo -e "${YELLOW}⚠️ Could not clean npm cache${NC}"

    # IDE caches
    rm -rf .vscode/.ropeproject/

    # Test artifacts
    rm -rf .vitest/
    rm -rf jest_*

    echo -e "${GREEN}✅ All cleanup complete${NC}"
}

# Fresh cleanup - complete reset including node_modules
clean_fresh() {
    echo -e "${BLUE}🧽 Fresh cleanup - complete reset...${NC}"
    echo -e "${YELLOW}⚠️ This will remove node_modules and require reinstallation${NC}"

    # First do all cleanup
    clean_all

    # Remove node_modules and lock files
    echo "Removing node_modules and lock files..."
    rm -rf node_modules/
    rm -f package-lock.json
    rm -f yarn.lock
    rm -f pnpm-lock.yaml

    # Clear global caches more aggressively
    npm cache clean --force 2>/dev/null || true

    echo -e "${GREEN}✅ Fresh cleanup complete${NC}"
    echo -e "${BLUE}💡 Run 'npm install' to reinstall dependencies${NC}"
}

# Validate cleanup was successful
validate_cleanup() {
    local level=$1
    echo -e "${BLUE}🔍 Validating cleanup...${NC}"

    # Check if dist directory was removed
    if [ ! -d "dist" ]; then
        echo -e "${GREEN}✅ Build artifacts removed${NC}"
    else
        echo -e "${YELLOW}⚠️ Some build artifacts may remain${NC}"
    fi

    # Check TypeScript build info
    if [ ! -f "*.tsbuildinfo" ] 2>/dev/null; then
        echo -e "${GREEN}✅ TypeScript build info cleared${NC}"
    fi

    # For fresh cleanup, check node_modules
    if [ "$level" = "fresh" ]; then
        if [ ! -d "node_modules" ]; then
            echo -e "${GREEN}✅ Dependencies removed${NC}"
            echo -e "${BLUE}📦 Ready for fresh installation${NC}"
        else
            echo -e "${YELLOW}⚠️ node_modules still exists${NC}"
        fi
    fi

    # Show remaining space
    if command -v du &> /dev/null; then
        CURRENT_SIZE=$(du -sh . 2>/dev/null | cut -f1 || echo "unknown")
        echo -e "${BLUE}📊 Current directory size: ${CURRENT_SIZE}${NC}"
    fi
}

# Main execution
main() {
    local level="${1:-basic}"

    case "$level" in
        "basic")
            clean_basic
            validate_cleanup "basic"
            ;;
        "all")
            clean_all
            validate_cleanup "all"
            ;;
        "fresh")
            clean_fresh
            validate_cleanup "fresh"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Unknown cleanup level: $level${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac

    echo ""
    echo -e "${GREEN}🎉 Cleanup complete!${NC}"
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi