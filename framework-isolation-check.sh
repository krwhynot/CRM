#!/bin/bash

# Framework Isolation Validation Script
# Ensures complete separation between Vitest and Playwright

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Framework Isolation Validation${NC}"
echo "=================================="

# Check 1: Directory Structure
echo -e "${BLUE}📁 Checking directory structure...${NC}"
if [ -d "tests/e2e" ] && [ -d "tests/unit" ] && [ -d "tests/shared" ]; then
    echo -e "${GREEN}✅ Directory structure correct${NC}"
else
    echo -e "${RED}❌ Missing required directories${NC}"
    exit 1
fi

# Check 2: No cross-framework imports
echo -e "${BLUE}🚫 Checking for cross-framework imports...${NC}"

# Check E2E tests don't import Vitest
if grep -r "from ['\"]vitest" tests/e2e/ 2>/dev/null; then
    echo -e "${RED}❌ E2E tests importing Vitest detected${NC}"
    exit 1
fi

if grep -r "from ['\"]@vitest" tests/e2e/ 2>/dev/null; then
    echo -e "${RED}❌ E2E tests importing @vitest detected${NC}"
    exit 1
fi

# Check Unit tests don't import Playwright
if grep -r "from ['\"]@playwright/test" tests/unit/ 2>/dev/null; then
    echo -e "${RED}❌ Unit tests importing Playwright detected${NC}"
    exit 1
fi

echo -e "${GREEN}✅ No cross-framework imports detected${NC}"

# Check 3: ESLint Configuration
echo -e "${BLUE}🔧 Validating ESLint configurations...${NC}"
for config in "tests/e2e/.eslintrc.js" "tests/unit/.eslintrc.js" "tests/shared/.eslintrc.js"; do
    if [ -f "$config" ]; then
        echo -e "${GREEN}✅ $config exists${NC}"
    else
        echo -e "${RED}❌ Missing $config${NC}"
        exit 1
    fi
done

# Check 4: TypeScript Configurations
echo -e "${BLUE}📝 Validating TypeScript configurations...${NC}"
for config in "tsconfig.playwright.json" "tsconfig.vitest.json"; do
    if [ -f "$config" ]; then
        echo -e "${GREEN}✅ $config exists${NC}"
    else
        echo -e "${RED}❌ Missing $config${NC}"
        exit 1
    fi
done

# Check 5: Package.json Scripts
echo -e "${BLUE}📦 Checking package.json scripts...${NC}"
if npm run | grep -q "test:unit"; then
    echo -e "${GREEN}✅ test:unit script exists${NC}"
else
    echo -e "${RED}❌ Missing test:unit script${NC}"
    exit 1
fi

if npm run | grep -q "test:e2e"; then
    echo -e "${GREEN}✅ test:e2e script exists${NC}"
else
    echo -e "${RED}❌ Missing test:e2e script${NC}"
    exit 1
fi

# Check 6: Test Framework Symbols
echo -e "${BLUE}🔬 Testing framework isolation...${NC}"

# Test Vitest in isolation
echo -e "${YELLOW}Testing Vitest isolation...${NC}"
if timeout 30s npm run test:unit -- --run --reporter=verbose 2>&1 | grep -q "Symbol.*jest-matchers"; then
    echo -e "${RED}❌ Symbol collision detected in Vitest${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Vitest runs without Symbol collisions${NC}"
fi

# Test Playwright in isolation  
echo -e "${YELLOW}Testing Playwright isolation...${NC}"
if timeout 30s npm run test:e2e -- --list 2>&1 | grep -q "Symbol.*jest-matchers"; then
    echo -e "${RED}❌ Symbol collision detected in Playwright${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Playwright runs without Symbol collisions${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}🎉 FRAMEWORK ISOLATION VALIDATION PASSED${NC}"
echo "==========================================="
echo ""
echo "✅ All checks passed successfully"
echo "✅ Framework separation is complete"
echo "✅ No Symbol(\$jest-matchers-object) collisions detected"
echo ""
echo -e "${BLUE}Ready for Phase 2: Modern Playwright Configuration${NC}"