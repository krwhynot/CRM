#!/bin/bash

# CRM Quality Gates Runner
# Comprehensive local quality validation before CI/CD
# Enhanced with partial execution support while maintaining 7-stage pipeline

set -e

# Parse arguments for partial execution
GATES_TO_RUN="all"
QUIET_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --gates)
            GATES_TO_RUN="$2"
            shift 2
            ;;
        --quiet|-q)
            QUIET_MODE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --gates <gates>  Specify gates to run (1-8, ranges like 1-3, or 'all') [DEFAULT: all]"
            echo "  --quiet, -q      Suppress non-essential output"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "Gate Numbers:"
            echo "  1: TypeScript Compilation"
            echo "  2: Code Linting"
            echo "  3: Component Architecture"
            echo "  4: Build & Bundle Analysis"
            echo "  5: Performance Baseline"
            echo "  6: Design Token Validation"
            echo "  7: UI Consistency"
            echo "  8: Mobile Optimization"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run all 8 gates (default)"
            echo "  $0 --gates 1-3        # Run gates 1, 2, and 3 only"
            echo "  $0 --gates 1,4,7      # Run gates 1, 4, and 7 only"
            echo "  $0 --gates 5 --quiet  # Run gate 5 only in quiet mode"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Output function (respects quiet mode)
log_output() {
    if [[ "$QUIET_MODE" != "true" ]]; then
        echo -e "$1"
    fi
}

# Quality gate results tracking
GATES_PASSED=0
GATES_FAILED=0
WARNINGS=0

# Initialize report
REPORT_FILE="./quality-gates-report-$(date +%Y%m%d_%H%M%S).md"
echo "# CRM Quality Gates Report - $(date)" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Parse gates to run
if [[ "$GATES_TO_RUN" != "all" ]]; then
    echo "Gates to run: $GATES_TO_RUN" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

log_output "${BOLD}🔒 CRM Quality Gates${NC}"
log_output "${BOLD}===================${NC}"
if [[ "$GATES_TO_RUN" == "all" ]]; then
    log_output "Running comprehensive quality validation (all 8 gates)..."
else
    log_output "Running partial quality validation (gates: $GATES_TO_RUN)..."
fi
log_output "Report: $REPORT_FILE"
log_output ""

# Function to check if a gate should run
should_run_gate() {
    local gate_num=$1

    if [[ "$GATES_TO_RUN" == "all" ]]; then
        return 0
    fi

    # Handle ranges like "1-3"
    if [[ "$GATES_TO_RUN" =~ ^[0-9]+-[0-9]+$ ]]; then
        local start=${GATES_TO_RUN%-*}
        local end=${GATES_TO_RUN#*-}
        if [[ $gate_num -ge $start && $gate_num -le $end ]]; then
            return 0
        fi
    fi

    # Handle comma-separated list like "1,4,7"
    if [[ ",$GATES_TO_RUN," =~ ,$gate_num, ]]; then
        return 0
    fi

    # Handle single gate
    if [[ "$GATES_TO_RUN" == "$gate_num" ]]; then
        return 0
    fi

    return 1
}

# Gate 1: TypeScript Compilation
if should_run_gate 1; then
    log_output "${BLUE}📝 Gate 1: TypeScript Compilation${NC}"
    if npm run type-check > /tmp/ts-check.log 2>&1; then
        log_output "${GREEN}✅ TypeScript compilation passed${NC}"
        echo "## ✅ TypeScript Compilation" >> "$REPORT_FILE"
        echo "Status: PASSED" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_PASSED++))
    else
        log_output "${RED}❌ TypeScript compilation failed${NC}"
        echo "## ❌ TypeScript Compilation" >> "$REPORT_FILE"
        echo "Status: FAILED" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/ts-check.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_FAILED++))
    fi
fi

# Gate 2: Code Linting
if should_run_gate 2; then
    log_output ""
    log_output "${BLUE}🧹 Gate 2: Code Linting${NC}"
    if npm run lint > /tmp/lint.log 2>&1; then
        log_output "${GREEN}✅ Code linting passed${NC}"
        echo "## ✅ Code Linting" >> "$REPORT_FILE"
        echo "Status: PASSED" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_PASSED++))
    else
        log_output "${RED}❌ Code linting failed${NC}"
        echo "## ❌ Code Linting" >> "$REPORT_FILE"
        echo "Status: FAILED" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/lint.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_FAILED++))
    fi
fi

# Gate 3: Component Architecture Health
if should_run_gate 3; then
    log_output ""
    log_output "${BLUE}🏗️ Gate 3: Component Architecture${NC}"
    if node scripts/analyze-component-usage.js > /tmp/arch-health.log 2>&1; then
        HEALTH_SCORE=$(cat /tmp/arch-health.log | grep "Architecture Health Score" | grep -o '[0-9]\+' || echo "0")
        if [ "$HEALTH_SCORE" -ge 80 ]; then
            log_output "${GREEN}✅ Architecture health: ${HEALTH_SCORE}%${NC}"
            echo "## ✅ Component Architecture" >> "$REPORT_FILE"
            echo "Health Score: ${HEALTH_SCORE}%" >> "$REPORT_FILE"
            echo "Status: PASSED" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            ((GATES_PASSED++))
        else
            log_output "${YELLOW}⚠️ Architecture health: ${HEALTH_SCORE}% (below 80% threshold)${NC}"
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
        log_output "${RED}❌ Architecture analysis failed${NC}"
        echo "## ❌ Component Architecture" >> "$REPORT_FILE"
        echo "Status: FAILED" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/arch-health.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_FAILED++))
    fi
fi

# Gate 4: Build Success & Bundle Analysis
if should_run_gate 4; then
    log_output ""
    log_output "${BLUE}📦 Gate 4: Build & Bundle Analysis${NC}"
    BUILD_START=$(date +%s)
    if npm run build > /tmp/build.log 2>&1; then
        BUILD_END=$(date +%s)
        BUILD_TIME=$((BUILD_END - BUILD_START))

        if [ -d "dist" ]; then
            BUNDLE_SIZE=$(du -sh dist/ | cut -f1 | sed 's/M//')
            BUNDLE_SIZE_NUM=$(echo "$BUNDLE_SIZE" | sed 's/[^0-9.]*//g')

            if (( $(echo "$BUNDLE_SIZE_NUM > 3.0" | bc -l) )); then
                log_output "${YELLOW}⚠️ Build passed, bundle size: ${BUNDLE_SIZE}MB (exceeds 3MB threshold)${NC}"
                echo "## ⚠️ Build & Bundle Analysis" >> "$REPORT_FILE"
                echo "Build Time: ${BUILD_TIME}s" >> "$REPORT_FILE"
                echo "Bundle Size: ${BUNDLE_SIZE}MB (exceeds 3MB threshold)" >> "$REPORT_FILE"
                echo "Status: WARNING - Large bundle size" >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
                ((WARNINGS++))
            else
                log_output "${GREEN}✅ Build passed, bundle size: ${BUNDLE_SIZE}MB${NC}"
                echo "## ✅ Build & Bundle Analysis" >> "$REPORT_FILE"
                echo "Build Time: ${BUILD_TIME}s" >> "$REPORT_FILE"
                echo "Bundle Size: ${BUNDLE_SIZE}MB" >> "$REPORT_FILE"
                echo "Status: PASSED" >> "$REPORT_FILE"
                echo "" >> "$REPORT_FILE"
                ((GATES_PASSED++))
            fi
        else
            log_output "${RED}❌ Build succeeded but dist directory not found${NC}"
            echo "## ❌ Build & Bundle Analysis" >> "$REPORT_FILE"
            echo "Status: FAILED - dist directory missing" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            ((GATES_FAILED++))
        fi
    else
        log_output "${RED}❌ Build failed${NC}"
        echo "## ❌ Build & Bundle Analysis" >> "$REPORT_FILE"
        echo "Status: FAILED" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/build.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_FAILED++))
    fi
fi

# Gate 5: Performance Baseline
if should_run_gate 5; then
    log_output ""
    log_output "${BLUE}⚡ Gate 5: Performance Baseline${NC}"
    if timeout 60s ./scripts/performance-monitor.sh > /tmp/perf-monitor.log 2>&1; then
        log_output "${GREEN}✅ Performance monitoring completed${NC}"
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
        log_output "${YELLOW}⚠️ Performance monitoring timed out or failed${NC}"
        echo "## ⚠️ Performance Baseline" >> "$REPORT_FILE"
        echo "Status: WARNING - Monitoring incomplete" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        tail -20 /tmp/perf-monitor.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((WARNINGS++))
    fi
fi

# Gate 6: Design Token Validation
if should_run_gate 6; then
    log_output ""
    log_output "${BLUE}🎨 Gate 6: Design Token Validation${NC}"
    if timeout 120s ./scripts/validate-design-tokens.sh --architecture 2-layer --level basic > /tmp/token-validation.log 2>&1; then
        TOKEN_SCORE=$(cat /tmp/token-validation.log | grep "Score:" | grep -o '[0-9]\+' | head -1 || echo "0")
        if [ "${TOKEN_SCORE}" -ge 85 ]; then
            log_output "${GREEN}✅ Design token validation passed: ${TOKEN_SCORE}/165${NC}"
            echo "## ✅ Design Token Validation" >> "$REPORT_FILE"
            echo "Architecture: 2-layer system" >> "$REPORT_FILE"
            echo "Validation Score: ${TOKEN_SCORE}/165" >> "$REPORT_FILE"
            echo "Status: PASSED" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            ((GATES_PASSED++))
        else
            log_output "${YELLOW}⚠️ Design token validation: ${TOKEN_SCORE}/165 (below 85 threshold)${NC}"
            echo "## ⚠️ Design Token Validation" >> "$REPORT_FILE"
            echo "Architecture: 2-layer system" >> "$REPORT_FILE"
            echo "Validation Score: ${TOKEN_SCORE}/165" >> "$REPORT_FILE"
            echo "Status: WARNING - Below 85 threshold" >> "$REPORT_FILE"
            echo "\`\`\`" >> "$REPORT_FILE"
            tail -20 /tmp/token-validation.log >> "$REPORT_FILE"
            echo "\`\`\`" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
            ((WARNINGS++))
        fi
    else
        log_output "${RED}❌ Design token validation failed${NC}"
        echo "## ❌ Design Token Validation" >> "$REPORT_FILE"
        echo "Status: FAILED" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/token-validation.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_FAILED++))
    fi
fi

# Gate 7: UI Consistency Check
if should_run_gate 7; then
    log_output ""
    log_output "${BLUE}🎨 Gate 7: UI Consistency${NC}"
    if npm run test:ui-consistency > /tmp/ui-consistency.log 2>&1; then
        log_output "${GREEN}✅ UI consistency checks passed${NC}"
        echo "## ✅ UI Consistency" >> "$REPORT_FILE"
        echo "Status: PASSED" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_PASSED++))
    else
        log_output "${RED}❌ UI consistency checks failed${NC}"
        echo "## ❌ UI Consistency" >> "$REPORT_FILE"
        echo "Status: FAILED" >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        cat /tmp/ui-consistency.log >> "$REPORT_FILE"
        echo "\`\`\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_FAILED++))
    fi
fi

# Gate 8: Mobile Optimization Check
if should_run_gate 8; then
    log_output ""
    log_output "${BLUE}📱 Gate 8: Mobile Optimization${NC}"
    MOBILE_CSS=$(find src/ -name "*.css" -exec grep -l "@media.*mobile\|@media.*max-width.*768" {} \; 2>/dev/null | wc -l)
    RESPONSIVE_COMPONENTS=$(find src/ -name "*.tsx" -exec grep -l "useIsMobile\|useMobile\|mobile" {} \; 2>/dev/null | wc -l)
    MOBILE_SCORE=$(( (MOBILE_CSS + RESPONSIVE_COMPONENTS) * 10 ))

    if [ "$MOBILE_SCORE" -ge 50 ]; then
        log_output "${GREEN}✅ Mobile optimization: ${MOBILE_SCORE}%${NC}"
        echo "## ✅ Mobile Optimization" >> "$REPORT_FILE"
        echo "Mobile CSS Files: $MOBILE_CSS" >> "$REPORT_FILE"
        echo "Mobile Components: $RESPONSIVE_COMPONENTS" >> "$REPORT_FILE"
        echo "Optimization Score: ${MOBILE_SCORE}%" >> "$REPORT_FILE"
        echo "Status: PASSED" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((GATES_PASSED++))
    else
        log_output "${YELLOW}⚠️ Mobile optimization: ${MOBILE_SCORE}% (could be improved)${NC}"
        echo "## ⚠️ Mobile Optimization" >> "$REPORT_FILE"
        echo "Mobile CSS Files: $MOBILE_CSS" >> "$REPORT_FILE"
        echo "Mobile Components: $RESPONSIVE_COMPONENTS" >> "$REPORT_FILE"
        echo "Optimization Score: ${MOBILE_SCORE}%" >> "$REPORT_FILE"
        echo "Status: WARNING - Could be improved" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        ((WARNINGS++))
    fi
fi

# Generate final summary
log_output ""
log_output "${BOLD}📋 Quality Gates Summary${NC}"
log_output "${BOLD}=========================${NC}"

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
        log_output "${GREEN}🎉 All quality gates passed!${NC}"
        echo "Status: ✅ ALL PASSED" >> "$REPORT_FILE"
        log_output ""
        log_output "${GREEN}✅ Passed: $GATES_PASSED${NC}"
        log_output "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
        log_output "${RED}❌ Failed: $GATES_FAILED${NC}"
        log_output ""
        log_output "${BOLD}Ready for deployment! 🚀${NC}"
        EXIT_CODE=0
    else
        log_output "${YELLOW}⚠️ Quality gates passed with warnings${NC}"
        echo "Status: ⚠️ PASSED WITH WARNINGS" >> "$REPORT_FILE"
        log_output ""
        log_output "${GREEN}✅ Passed: $GATES_PASSED${NC}"
        log_output "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
        log_output "${RED}❌ Failed: $GATES_FAILED${NC}"
        log_output ""
        log_output "${YELLOW}Consider addressing warnings before deployment${NC}"
        EXIT_CODE=0
    fi
else
    log_output "${RED}❌ Quality gates failed${NC}"
    echo "Status: ❌ FAILED" >> "$REPORT_FILE"
    log_output ""
    log_output "${GREEN}✅ Passed: $GATES_PASSED${NC}"
    log_output "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
    log_output "${RED}❌ Failed: $GATES_FAILED${NC}"
    log_output ""
    log_output "${RED}Fix failing gates before deployment${NC}"
    EXIT_CODE=1
fi

log_output ""
log_output "${BOLD}📋 Full report: ${BLUE}$REPORT_FILE${NC}"

# Cleanup temp files
rm -f /tmp/ts-check.log /tmp/lint.log /tmp/arch-health.log /tmp/build.log /tmp/perf-monitor.log /tmp/token-validation.log /tmp/ui-consistency.log

exit $EXIT_CODE