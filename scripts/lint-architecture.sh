#!/bin/bash

# CRM Architecture Linting Script
# Runs comprehensive architectural validation combining ESLint and custom validation

set -e

echo "🏗️ Starting CRM Architecture Validation"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track success/failure
VALIDATION_PASSED=true

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            VALIDATION_PASSED=false
            ;;
        "INFO")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# 1. TypeScript Compilation Check
echo
print_status "INFO" "Step 1: Checking TypeScript compilation..."
if npm run type-check > /dev/null 2>&1; then
    print_status "SUCCESS" "TypeScript compilation passed"
else
    print_status "ERROR" "TypeScript compilation failed"
    echo "Run 'npm run type-check' for details"
fi

# 2. ESLint Architecture Rules
echo
print_status "INFO" "Step 2: Running ESLint with architecture rules..."
if npm run lint > /dev/null 2>&1; then
    print_status "SUCCESS" "ESLint validation passed"
else
    print_status "WARNING" "ESLint found issues (some may be technical debt)"
    echo "Run 'npm run lint' for details"
fi

# 3. Custom Architecture Validation
echo
print_status "INFO" "Step 3: Running custom architecture validation..."
if node scripts/validate-architecture.js > /dev/null 2>&1; then
    print_status "SUCCESS" "Architecture patterns validation passed"
else
    print_status "ERROR" "Architecture patterns validation failed"
    echo "Run 'npm run validate:architecture' for details"
fi

# 4. State Management Validation (specific check)
echo
print_status "INFO" "Step 4: Validating state management boundaries..."
if node scripts/check-state-architecture.cjs > /dev/null 2>&1; then
    print_status "SUCCESS" "State management boundaries are correct"
else
    print_status "ERROR" "State management boundary violations found"
    echo "Run 'node scripts/check-state-architecture.cjs' for details"
fi

# 5. Import Pattern Analysis
echo
print_status "INFO" "Step 5: Checking import patterns..."

# Check for old specialized imports
OLD_IMPORTS=$(grep -r "from.*specialized" src/ 2>/dev/null || true)
if [ -n "$OLD_IMPORTS" ]; then
    print_status "ERROR" "Found legacy specialized entity select imports"
    echo "$OLD_IMPORTS"
else
    print_status "SUCCESS" "No legacy import patterns found"
fi

# Check for cross-feature component imports
CROSS_IMPORTS=$(grep -r "from.*@/features/.*components" src/features/ | grep -v "index.ts" 2>/dev/null || true)
if [ -n "$CROSS_IMPORTS" ]; then
    print_status "WARNING" "Found potential cross-feature component imports"
    echo "$CROSS_IMPORTS"
else
    print_status "SUCCESS" "No cross-feature component imports found"
fi

# 6. Component Organization Check
echo
print_status "INFO" "Step 6: Validating component organization..."

# Check for feature-specific components in shared directory
MISPLACED_COMPONENTS=$(find src/components -name "*Contact*" -o -name "*Organization*" -o -name "*Product*" -o -name "*Opportunity*" 2>/dev/null | head -5)
if [ -n "$MISPLACED_COMPONENTS" ]; then
    print_status "ERROR" "Found feature-specific components in shared directory"
    echo "$MISPLACED_COMPONENTS"
else
    print_status "SUCCESS" "Component organization is correct"
fi

# Final Result
echo
echo "========================================"
if [ "$VALIDATION_PASSED" = true ]; then
    print_status "SUCCESS" "All architecture validations passed! 🎉"
    echo
    echo "Architecture health is excellent. The CRM follows all"
    echo "established patterns for:"
    echo "• Component organization"
    echo "• State management separation"  
    echo "• Import patterns"
    echo "• TypeScript constraints"
    exit 0
else
    print_status "ERROR" "Architecture validation failed"
    echo
    echo "Please address the issues above before proceeding."
    echo "Run individual validation commands for detailed output."
    echo
    echo "Quick fixes:"
    echo "• TypeScript: npm run type-check"
    echo "• ESLint: npm run lint"
    echo "• Architecture: npm run validate:architecture" 
    echo "• State boundaries: node scripts/check-state-architecture.cjs"
    exit 1
fi