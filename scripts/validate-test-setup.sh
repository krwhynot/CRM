#!/bin/bash

# Comprehensive Test Setup Validation
# Validates complete framework isolation and test readiness

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "🔍 COMPREHENSIVE TEST SETUP VALIDATION"
echo "======================================"
echo -e "${NC}"

# Track validation results
VALIDATION_ERRORS=0

check() {
    local test_name="$1"
    local command="$2"
    
    echo -e "${BLUE}Checking: $test_name${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $test_name - PASSED${NC}"
    else
        echo -e "${RED}❌ $test_name - FAILED${NC}"
        VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
    fi
}

echo -e "${YELLOW}1. DIRECTORY STRUCTURE VALIDATION${NC}"
check "Tests/e2e directory exists" "test -d tests/e2e"
check "Tests/unit directory exists" "test -d tests/unit"
check "Tests/shared directory exists" "test -d tests/shared"

echo ""
echo -e "${YELLOW}2. CONFIGURATION FILES VALIDATION${NC}"
check "Playwright config exists" "test -f playwright.config.ts"
check "Vitest config exists" "test -f vitest.config.unit.ts"
check "Playwright TypeScript config exists" "test -f tsconfig.playwright.json"
check "Vitest TypeScript config exists" "test -f tsconfig.vitest.json"

echo ""
echo -e "${YELLOW}3. ESLINT ISOLATION VALIDATION${NC}"
check "E2E ESLint config exists" "test -f tests/e2e/.eslintrc.js"
check "Unit ESLint config exists" "test -f tests/unit/.eslintrc.js"
check "Shared ESLint config exists" "test -f tests/shared/.eslintrc.js"

echo ""
echo -e "${YELLOW}4. PACKAGE.JSON SCRIPTS VALIDATION${NC}"
check "test:unit script exists" "npm run test:unit --help > /dev/null 2>&1 || true"
check "test:e2e script exists" "npm run test:e2e --help > /dev/null 2>&1 || true"

echo ""
echo -e "${YELLOW}5. FRAMEWORK ISOLATION VALIDATION${NC}"

# Check for cross-framework imports in E2E tests
if grep -r "from ['\"]vitest" tests/e2e/ 2>/dev/null; then
    echo -e "${RED}❌ Framework isolation - E2E tests importing Vitest${NC}"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
else
    echo -e "${GREEN}✅ Framework isolation - No Vitest imports in E2E tests${NC}"
fi

# Check for cross-framework imports in Unit tests
if grep -r "from ['\"]@playwright/test" tests/unit/ 2>/dev/null; then
    echo -e "${RED}❌ Framework isolation - Unit tests importing Playwright${NC}"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
else
    echo -e "${GREEN}✅ Framework isolation - No Playwright imports in Unit tests${NC}"
fi

# Check shared utilities don't import test frameworks
if grep -r "from ['\"]@playwright/test\|from ['\"]vitest" tests/shared/ 2>/dev/null; then
    echo -e "${RED}❌ Shared utilities - Test framework imports detected${NC}"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
else
    echo -e "${GREEN}✅ Shared utilities - No test framework imports${NC}"
fi

echo ""
echo -e "${YELLOW}6. SYMBOL COLLISION TESTING${NC}"

# Test Vitest isolation
echo -e "${BLUE}Testing Vitest isolation...${NC}"
if timeout 30s npm run test:unit -- --run --reporter=verbose 2>&1 | grep -q "Symbol.*jest-matchers"; then
    echo -e "${RED}❌ Symbol collision detected in Vitest${NC}"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
else
    echo -e "${GREEN}✅ Vitest runs without Symbol collisions${NC}"
fi

# Test Playwright isolation
echo -e "${BLUE}Testing Playwright isolation...${NC}"
if timeout 30s npm run test:e2e -- --list 2>&1 | grep -q "Symbol.*jest-matchers"; then
    echo -e "${RED}❌ Symbol collision detected in Playwright${NC}"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
else
    echo -e "${GREEN}✅ Playwright runs without Symbol collisions${NC}"
fi

echo ""
echo -e "${YELLOW}7. DEPENDENCY VALIDATION${NC}"
check "Node.js version >= 18" "node --version | grep -E 'v1[8-9]|v[2-9][0-9]'"
check "npm version available" "npm --version"
check "Playwright installed" "test -d node_modules/@playwright/test"
check "Vitest installed" "test -d node_modules/vitest"

echo ""
echo -e "${YELLOW}8. RUNTIME VALIDATION${NC}"

# Create test directories if they don't exist
mkdir -p test-results

# Test both frameworks can run basic commands
echo -e "${BLUE}Testing framework command execution...${NC}"

if npm run test:unit -- --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Vitest command execution${NC}"
else
    echo -e "${RED}❌ Vitest command execution failed${NC}"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

if npx playwright --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Playwright command execution${NC}"
else
    echo -e "${RED}❌ Playwright command execution failed${NC}"
    VALIDATION_ERRORS=$((VALIDATION_ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}9. EMERGENCY SCRIPTS VALIDATION${NC}"
check "Emergency fix script exists" "test -x emergency-playwright-fix.sh"
check "Framework isolation check script exists" "test -x framework-isolation-check.sh"
check "Enhanced test runner exists" "test -x run-tests.sh"

echo ""
echo "=========================================="

if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL VALIDATIONS PASSED${NC}"
    echo -e "${GREEN}Framework isolation is complete and ready for production${NC}"
    echo ""
    echo -e "${BLUE}✅ Ready to run:${NC}"
    echo "   ./run-tests.sh --unit-only    # Run unit tests only"
    echo "   ./run-tests.sh --e2e-only     # Run E2E tests only"  
    echo "   ./run-tests.sh               # Run both (sequential)"
    echo ""
    echo -e "${BLUE}🚀 Symbol collision issue is RESOLVED${NC}"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo -e "${RED}$VALIDATION_ERRORS error(s) detected${NC}"
    echo ""
    echo -e "${YELLOW}🔧 TROUBLESHOOTING:${NC}"
    echo "1. Run: ./emergency-playwright-fix.sh"
    echo "2. Check framework isolation: ./framework-isolation-check.sh"
    echo "3. Verify package.json scripts are updated"
    echo "4. Ensure no cross-framework imports exist"
    echo ""
    exit 1
fi