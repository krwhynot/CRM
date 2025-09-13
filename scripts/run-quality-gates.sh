#!/bin/bash

# CRM Quality Gates Runner
# Comprehensive local quality validation before CI/CD

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Quality gate results tracking
GATES_PASSED=0
GATES_FAILED=0
WARNINGS=0

# Initialize report
REPORT_FILE="./quality-gates-report-$(date +%Y%m%d_%H%M%S).md"
echo "# CRM Quality Gates Report - $(date)" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo -e "${BOLD}🔒 CRM Quality Gates${NC}"
echo -e "${BOLD}===================${NC}"
echo "Running comprehensive quality validation..."
echo "Report: $REPORT_FILE"
echo ""

# Gate 1: TypeScript Compilation
echo -e "${BLUE}📝 Gate 1: TypeScript Compilation${NC}"
if npm run type-check > /tmp/ts-check.log 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilation passed${NC}"
    echo "## ✅ TypeScript Compilation" >> "$REPORT_FILE"
    echo "Status: PASSED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_PASSED++))
else
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    echo "## ❌ TypeScript Compilation" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/ts-check.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_FAILED++))
fi

# Gate 2: Code Linting
echo ""
echo -e "${BLUE}🧹 Gate 2: Code Linting${NC}"
if npm run lint > /tmp/lint.log 2>&1; then
    echo -e "${GREEN}✅ Code linting passed${NC}"
    echo "## ✅ Code Linting" >> "$REPORT_FILE"
    echo "Status: PASSED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_PASSED++))
else
    echo -e "${RED}❌ Code linting failed${NC}"
    echo "## ❌ Code Linting" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/lint.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_FAILED++))
fi

# Gate 3: Component Architecture Health
echo ""
echo -e "${BLUE}🏗️ Gate 3: Component Architecture${NC}"
if node scripts/analyze-component-usage.js > /tmp/arch-health.log 2>&1; then
    HEALTH_SCORE=$(cat /tmp/arch-health.log | grep "Architecture Health Score" | grep -o '[0-9]\+' || echo "0")
    if [ "$HEALTH_SCORE" -ge 80 ]; then
        echo -e "${GREEN}✅ Architecture health: ${HEALTH_SCORE}%${NC}"
        echo "## ✅ Component Architecture" >> "$REPORT_FILE"
        echo "Health Score: ${HEALTH_SCORE}%" >> "$REPORT_FILE"
        echo "Status: PASSED" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_PASSED++))
    else
        echo -e "${YELLOW}⚠️ Architecture health: ${HEALTH_SCORE}% (below 80% threshold)${NC}"
        echo "## ⚠️ Component Architecture" >> "$REPORT_FILE"
        echo "Health Score: ${HEALTH_SCORE}%" >> "$REPORT_FILE"
        echo "Status: WARNING - Below 80% threshold" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/arch-health.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ Architecture analysis failed${NC}"
    echo "## ❌ Component Architecture" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/arch-health.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_FAILED++))
fi

# Gate 4: Build Success & Bundle Analysis
echo ""
echo -e "${BLUE}📦 Gate 4: Build & Bundle Analysis${NC}"
BUILD_START=$(date +%s)
if npm run build > /tmp/build.log 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist/ | cut -f1 | sed 's/M//')
        BUNDLE_SIZE_NUM=$(echo "$BUNDLE_SIZE" | sed 's/[^0-9.]*//g')
        
        if (( $(echo "$BUNDLE_SIZE_NUM > 3.0" | bc -l) )); then
            echo -e "${YELLOW}⚠️ Build passed, bundle size: ${BUNDLE_SIZE}MB (exceeds 3MB threshold)${NC}"
            echo "## ⚠️ Build & Bundle Analysis" >> "$REPORT_FILE"
            echo "Build Time: ${BUILD_TIME}s" >> "$REPORT_FILE"
            echo "Bundle Size: ${BUNDLE_SIZE}MB (exceeds 3MB threshold)" >> "$REPORT_FILE"
            echo "Status: WARNING - Large bundle size" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✅ Build passed, bundle size: ${BUNDLE_SIZE}MB${NC}"
            echo "## ✅ Build & Bundle Analysis" >> "$REPORT_FILE"
            echo "Build Time: ${BUILD_TIME}s" >> "$REPORT_FILE"
            echo "Bundle Size: ${BUNDLE_SIZE}MB" >> "$REPORT_FILE"
            echo "Status: PASSED" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            ((GATES_PASSED++))
        fi
    else
        echo -e "${RED}❌ Build succeeded but dist directory not found${NC}"
        echo "## ❌ Build & Bundle Analysis" >> "$REPORT_FILE"
        echo "Status: FAILED - dist directory missing" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_FAILED++))
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "## ❌ Build & Bundle Analysis" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/build.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_FAILED++))
fi

# Gate 5: Performance Baseline
echo ""
echo -e "${BLUE}⚡ Gate 5: Performance Baseline${NC}"
if timeout 60s ./scripts/performance-monitor.sh > /tmp/perf-monitor.log 2>&1; then
    echo -e "${GREEN}✅ Performance monitoring completed${NC}"
    echo "## ✅ Performance Baseline" >> "$REPORT_FILE"
    echo "Status: PASSED" >> "$REPORT_FILE"
    
    # Extract key metrics if available
    if [ -f "performance-reports/performance_report_$(date +%Y%m%d)_"*.md ]; then
        LATEST_REPORT=$(ls -t performance-reports/performance_report_$(date +%Y%m%d)_*.md | head -1)
        echo "Report: $LATEST_REPORT" >> "$REPORT_FILE"
    fi
    echo "" >> "$REPORT_FILE"
    ((GATES_PASSED++))
else
    echo -e "${YELLOW}⚠️ Performance monitoring timed out or failed${NC}"
    echo "## ⚠️ Performance Baseline" >> "$REPORT_FILE"
    echo "Status: WARNING - Monitoring incomplete" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    tail -20 /tmp/perf-monitor.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((WARNINGS++))
fi

# Gate 6: UI Consistency Check
echo ""
echo -e "${BLUE}🎨 Gate 6: UI Consistency${NC}"
if npm run test:ui-consistency > /tmp/ui-consistency.log 2>&1; then
    echo -e "${GREEN}✅ UI consistency checks passed${NC}"
    echo "## ✅ UI Consistency" >> "$REPORT_FILE"
    echo "Status: PASSED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_PASSED++))
else
    echo -e "${RED}❌ UI consistency checks failed${NC}"
    echo "## ❌ UI Consistency" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/ui-consistency.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_FAILED++))
fi

# Gate 7: Design Token Coverage
echo ""
echo -e "${BLUE}🎨 Gate 7: Design Token Coverage${NC}"
if npm run tokens:coverage > /tmp/token-coverage.log 2>&1; then
    TOKEN_COVERAGE=$(cat /tmp/token-coverage.log | grep "Overall Token Coverage" | grep -o '[0-9]\+' || echo "0")
    if [ "$TOKEN_COVERAGE" -ge 75 ]; then
        echo -e "${GREEN}✅ Token coverage: ${TOKEN_COVERAGE}%${NC}"
        echo "## ✅ Design Token Coverage" >> "$REPORT_FILE"
        echo "Coverage: ${TOKEN_COVERAGE}%" >> "$REPORT_FILE"
        echo "Status: PASSED" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_PASSED++))
    else
        echo -e "${YELLOW}⚠️ Token coverage: ${TOKEN_COVERAGE}% (below 75% threshold)${NC}"
        echo "## ⚠️ Design Token Coverage" >> "$REPORT_FILE"
        echo "Coverage: ${TOKEN_COVERAGE}%" >> "$REPORT_FILE"
        echo "Status: WARNING - Below 75% threshold" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/token-coverage.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ Token coverage analysis failed${NC}"
    echo "## ❌ Design Token Coverage" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/token-coverage.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_FAILED++))
fi

# Gate 8: Mobile Optimization Check
echo ""
echo -e "${BLUE}📱 Gate 8: Mobile Optimization${NC}"
MOBILE_CSS=$(find src/ -name "*.css" -exec grep -l "@media.*mobile\|@media.*max-width.*768" {} \; 2>/dev/null | wc -l)
RESPONSIVE_COMPONENTS=$(find src/ -name "*.tsx" -exec grep -l "useIsMobile\|useMobile\|mobile" {} \; 2>/dev/null | wc -l)
MOBILE_SCORE=$(( (MOBILE_CSS + RESPONSIVE_COMPONENTS) * 10 ))

if [ "$MOBILE_SCORE" -ge 50 ]; then
    echo -e "${GREEN}✅ Mobile optimization: ${MOBILE_SCORE}%${NC}"
    echo "## ✅ Mobile Optimization" >> "$REPORT_FILE"
    echo "Mobile CSS Files: $MOBILE_CSS" >> "$REPORT_FILE"
    echo "Mobile Components: $RESPONSIVE_COMPONENTS" >> "$REPORT_FILE"
    echo "Optimization Score: ${MOBILE_SCORE}%" >> "$REPORT_FILE"
    echo "Status: PASSED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_PASSED++))
else
    echo -e "${YELLOW}⚠️ Mobile optimization: ${MOBILE_SCORE}% (could be improved)${NC}"
    echo "## ⚠️ Mobile Optimization" >> "$REPORT_FILE"
    echo "Mobile CSS Files: $MOBILE_CSS" >> "$REPORT_FILE"
    echo "Mobile Components: $RESPONSIVE_COMPONENTS" >> "$REPORT_FILE"
    echo "Optimization Score: ${MOBILE_SCORE}%" >> "$REPORT_FILE"
    echo "Status: WARNING - Could be improved" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((WARNINGS++))
fi

# Gate 9: Table Component Consistency
echo ""
echo -e "${BLUE}🏗️ Gate 9: Table Component Consistency${NC}"
if node scripts/validate-table-consistency.cjs > /tmp/table-consistency.log 2>&1; then
    CONSISTENCY_SCORE=$(cat /tmp/table-consistency.log | grep "Consistency Score" | grep -o '[0-9]\+' || echo "0")
    if [ "$CONSISTENCY_SCORE" -ge 80 ]; then
        echo -e "${GREEN}✅ Table consistency: ${CONSISTENCY_SCORE}%${NC}"
        echo "## ✅ Table Component Consistency" >> "$REPORT_FILE"
        echo "Consistency Score: ${CONSISTENCY_SCORE}%" >> "$REPORT_FILE"
        echo "Status: PASSED" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_PASSED++))
    else
        echo -e "${YELLOW}⚠️ Table consistency: ${CONSISTENCY_SCORE}% (below 80% threshold)${NC}"
        echo "## ⚠️ Table Component Consistency" >> "$REPORT_FILE"
        echo "Consistency Score: ${CONSISTENCY_SCORE}%" >> "$REPORT_FILE"
        echo "Status: WARNING - Below 80% threshold" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/table-consistency.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ Table consistency validation failed${NC}"
    echo "## ❌ Table Component Consistency" >> "$REPORT_FILE"
    echo "Status: FAILED" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    cat /tmp/table-consistency.log >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    ((GATES_FAILED++))
fi

# Generate final summary
echo ""
echo -e "${BOLD}📋 Quality Gates Summary${NC}"
echo -e "${BOLD}=========================${NC}"

# Add summary to report
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| Metric | Count |" >> "$REPORT_FILE"
echo "|--------|-------|" >> "$REPORT_FILE"
echo "| ✅ Passed | $GATES_PASSED |" >> "$REPORT_FILE"
echo "| ❌ Failed | $GATES_FAILED |" >> "$REPORT_FILE"
echo "| ⚠️ Warnings | $WARNINGS |" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ "$GATES_FAILED" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}🎉 All quality gates passed!${NC}"
        echo "Status: ✅ ALL PASSED" >> "$REPORT_FILE"
        echo ""
        echo -e "${GREEN}✅ Passed: $GATES_PASSED${NC}"
        echo -e "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
        echo -e "${RED}❌ Failed: $GATES_FAILED${NC}"
        echo ""
        echo -e "${BOLD}Ready for deployment! 🚀${NC}"
        EXIT_CODE=0
    else
        echo -e "${YELLOW}⚠️ Quality gates passed with warnings${NC}"
        echo "Status: ⚠️ PASSED WITH WARNINGS" >> "$REPORT_FILE"
        echo ""
        echo -e "${GREEN}✅ Passed: $GATES_PASSED${NC}"
        echo -e "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
        echo -e "${RED}❌ Failed: $GATES_FAILED${NC}"
        echo ""
        echo -e "${YELLOW}Consider addressing warnings before deployment${NC}"
        EXIT_CODE=0
    fi
else
    echo -e "${RED}❌ Quality gates failed${NC}"
    echo "Status: ❌ FAILED" >> "$REPORT_FILE"
    echo ""
    echo -e "${GREEN}✅ Passed: $GATES_PASSED${NC}"
    echo -e "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
    echo -e "${RED}❌ Failed: $GATES_FAILED${NC}"
    echo ""
    echo -e "${RED}Fix failing gates before deployment${NC}"
    EXIT_CODE=1
fi

echo ""
echo -e "${BOLD}📋 Full report: ${BLUE}$REPORT_FILE${NC}"

# Cleanup temp files
rm -f /tmp/ts-check.log /tmp/lint.log /tmp/arch-health.log /tmp/build.log /tmp/perf-monitor.log /tmp/ui-consistency.log /tmp/token-coverage.log

exit $EXIT_CODE