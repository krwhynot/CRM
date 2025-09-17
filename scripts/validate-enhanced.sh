#!/bin/bash

# CRM Enhanced Validation System
# Parameterized validation with different execution levels
# Supports: basic, full, architecture, performance, quality-gates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Default validation level
VALIDATION_LEVEL="${1:-basic}"

# Results tracking
VALIDATIONS_PASSED=0
VALIDATIONS_FAILED=0
WARNINGS=0

# Function to print usage
print_usage() {
    echo "Usage: $0 [level] [options]"
    echo ""
    echo "Validation Levels:"
    echo "  basic        - Essential validation (type-check, lint, build) [DEFAULT]"
    echo "  full         - Comprehensive validation (basic + architecture + performance)"
    echo "  architecture - Architecture-specific validation only"
    echo "  performance  - Performance validation only"
    echo "  quality-gates - Full quality gates pipeline (7-stage)"
    echo ""
    echo "Options:"
    echo "  --help, -h   - Show this help message"
    echo "  --quiet, -q  - Suppress non-essential output"
    echo "  --report     - Generate markdown report"
    echo ""
    echo "Examples:"
    echo "  $0 basic                    # Quick essential validation"
    echo "  $0 full --report            # Full validation with report"
    echo "  $0 architecture --quiet     # Silent architecture validation"
    echo "  $0 quality-gates           # Complete quality gates pipeline"
}

# Parse options
QUIET=false
GENERATE_REPORT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            print_usage
            exit 0
            ;;
        --quiet|-q)
            QUIET=true
            shift
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        basic|full|architecture|performance|quality-gates)
            if [[ -z "$VALIDATION_LEVEL" || "$VALIDATION_LEVEL" == "basic" ]]; then
                VALIDATION_LEVEL="$1"
            fi
            shift
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Report initialization
if [[ "$GENERATE_REPORT" == "true" ]]; then
    REPORT_FILE="./validation-report-${VALIDATION_LEVEL}-$(date +%Y%m%d_%H%M%S).md"
    echo "# Enhanced Validation Report - ${VALIDATION_LEVEL} - $(date)" > "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Output function (respects quiet mode)
log_output() {
    if [[ "$QUIET" != "true" ]]; then
        echo -e "$1"
    fi
}

# Report function
add_to_report() {
    if [[ "$GENERATE_REPORT" == "true" ]]; then
        echo "$1" >> "$REPORT_FILE"
    fi
}

# Validation functions
run_typescript_check() {
    log_output "${BLUE}📝 TypeScript Compilation${NC}"
    if npm run type-check > /tmp/ts-check.log 2>&1; then
        log_output "${GREEN}✅ TypeScript compilation passed${NC}"
        add_to_report "## ✅ TypeScript Compilation"
        add_to_report "Status: PASSED"
        add_to_report ""
        ((VALIDATIONS_PASSED++))
        return 0
    else
        log_output "${RED}❌ TypeScript compilation failed${NC}"
        add_to_report "## ❌ TypeScript Compilation"
        add_to_report "Status: FAILED"
        add_to_report "\`\`\`"
        add_to_report "$(cat /tmp/ts-check.log)"
        add_to_report "\`\`\`"
        add_to_report ""
        ((VALIDATIONS_FAILED++))
        return 1
    fi
}

run_linting() {
    log_output "${BLUE}🧹 Code Linting${NC}"
    if npm run lint > /tmp/lint.log 2>&1; then
        log_output "${GREEN}✅ Code linting passed${NC}"
        add_to_report "## ✅ Code Linting"
        add_to_report "Status: PASSED"
        add_to_report ""
        ((VALIDATIONS_PASSED++))
        return 0
    else
        log_output "${RED}❌ Code linting failed${NC}"
        add_to_report "## ❌ Code Linting"
        add_to_report "Status: FAILED"
        add_to_report "\`\`\`"
        add_to_report "$(cat /tmp/lint.log)"
        add_to_report "\`\`\`"
        add_to_report ""
        ((VALIDATIONS_FAILED++))
        return 1
    fi
}

run_build() {
    log_output "${BLUE}📦 Build Validation${NC}"
    BUILD_START=$(date +%s)
    if npm run build > /tmp/build.log 2>&1; then
        BUILD_END=$(date +%s)
        BUILD_TIME=$((BUILD_END - BUILD_START))

        if [ -d "dist" ]; then
            BUNDLE_SIZE=$(du -sh dist/ | cut -f1 | sed 's/M//')
            BUNDLE_SIZE_NUM=$(echo "$BUNDLE_SIZE" | sed 's/[^0-9.]*//g')

            if (( $(echo "$BUNDLE_SIZE_NUM > 3.0" | bc -l) )); then
                log_output "${YELLOW}⚠️ Build passed, bundle size: ${BUNDLE_SIZE}MB (exceeds 3MB threshold)${NC}"
                add_to_report "## ⚠️ Build Validation"
                add_to_report "Build Time: ${BUILD_TIME}s"
                add_to_report "Bundle Size: ${BUNDLE_SIZE}MB (exceeds 3MB threshold)"
                add_to_report "Status: WARNING - Large bundle size"
                add_to_report ""
                ((WARNINGS++))
                return 0
            else
                log_output "${GREEN}✅ Build passed, bundle size: ${BUNDLE_SIZE}MB${NC}"
                add_to_report "## ✅ Build Validation"
                add_to_report "Build Time: ${BUILD_TIME}s"
                add_to_report "Bundle Size: ${BUNDLE_SIZE}MB"
                add_to_report "Status: PASSED"
                add_to_report ""
                ((VALIDATIONS_PASSED++))
                return 0
            fi
        else
            log_output "${RED}❌ Build succeeded but dist directory not found${NC}"
            add_to_report "## ❌ Build Validation"
            add_to_report "Status: FAILED - dist directory missing"
            add_to_report ""
            ((VALIDATIONS_FAILED++))
            return 1
        fi
    else
        log_output "${RED}❌ Build failed${NC}"
        add_to_report "## ❌ Build Validation"
        add_to_report "Status: FAILED"
        add_to_report "\`\`\`"
        add_to_report "$(cat /tmp/build.log)"
        add_to_report "\`\`\`"
        add_to_report ""
        ((VALIDATIONS_FAILED++))
        return 1
    fi
}

run_architecture_validation() {
    log_output "${BLUE}🏗️ Architecture Validation${NC}"
    if node scripts/analyze-component-usage.js > /tmp/arch-health.log 2>&1; then
        HEALTH_SCORE=$(cat /tmp/arch-health.log | grep "Architecture Health Score" | grep -o '[0-9]\+' || echo "0")
        if [ "$HEALTH_SCORE" -ge 80 ]; then
            log_output "${GREEN}✅ Architecture health: ${HEALTH_SCORE}%${NC}"
            add_to_report "## ✅ Architecture Validation"
            add_to_report "Health Score: ${HEALTH_SCORE}%"
            add_to_report "Status: PASSED"
            add_to_report ""
            ((VALIDATIONS_PASSED++))
            return 0
        else
            log_output "${YELLOW}⚠️ Architecture health: ${HEALTH_SCORE}% (below 80% threshold)${NC}"
            add_to_report "## ⚠️ Architecture Validation"
            add_to_report "Health Score: ${HEALTH_SCORE}%"
            add_to_report "Status: WARNING - Below 80% threshold"
            add_to_report "\`\`\`"
            add_to_report "$(cat /tmp/arch-health.log)"
            add_to_report "\`\`\`"
            add_to_report ""
            ((WARNINGS++))
            return 0
        fi
    else
        log_output "${RED}❌ Architecture analysis failed${NC}"
        add_to_report "## ❌ Architecture Validation"
        add_to_report "Status: FAILED"
        add_to_report "\`\`\`"
        add_to_report "$(cat /tmp/arch-health.log)"
        add_to_report "\`\`\`"
        add_to_report ""
        ((VALIDATIONS_FAILED++))
        return 1
    fi
}

run_performance_validation() {
    log_output "${BLUE}⚡ Performance Validation${NC}"
    if timeout 60s ./scripts/performance-monitor.sh > /tmp/perf-monitor.log 2>&1; then
        log_output "${GREEN}✅ Performance monitoring completed${NC}"
        add_to_report "## ✅ Performance Validation"
        add_to_report "Status: PASSED"

        # Extract key metrics if available
        if [ -f "performance-reports/performance_report_$(date +%Y%m%d)_"*.md ]; then
            LATEST_REPORT=$(ls -t performance-reports/performance_report_$(date +%Y%m%d)_*.md | head -1)
            add_to_report "Report: $LATEST_REPORT"
        fi
        add_to_report ""
        ((VALIDATIONS_PASSED++))
        return 0
    else
        log_output "${YELLOW}⚠️ Performance monitoring timed out or failed${NC}"
        add_to_report "## ⚠️ Performance Validation"
        add_to_report "Status: WARNING - Monitoring incomplete"
        add_to_report "\`\`\`"
        add_to_report "$(tail -20 /tmp/perf-monitor.log)"
        add_to_report "\`\`\`"
        add_to_report ""
        ((WARNINGS++))
        return 0
    fi
}

# Main validation logic
log_output "${BOLD}🔍 Enhanced Validation System - ${VALIDATION_LEVEL}${NC}"
log_output "${BOLD}=================================${NC}"

case "$VALIDATION_LEVEL" in
    basic)
        log_output "Running basic validation (type-check, lint, build)..."
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            echo "Validation Level: Basic (Essential)" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
        run_typescript_check
        run_linting
        run_build
        ;;

    full)
        log_output "Running full validation (basic + architecture + performance)..."
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            echo "Validation Level: Full (Comprehensive)" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
        run_typescript_check
        run_linting
        run_build
        run_architecture_validation
        run_performance_validation
        ;;

    architecture)
        log_output "Running architecture validation only..."
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            echo "Validation Level: Architecture Only" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
        run_architecture_validation
        ;;

    performance)
        log_output "Running performance validation only..."
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            echo "Validation Level: Performance Only" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
        run_performance_validation
        ;;

    quality-gates)
        log_output "Running complete quality gates pipeline..."
        log_output "${YELLOW}Delegating to quality gates pipeline...${NC}"
        exec ./scripts/run-quality-gates.sh
        ;;

    *)
        echo "Invalid validation level: $VALIDATION_LEVEL"
        print_usage
        exit 1
        ;;
esac

# Generate summary
log_output ""
log_output "${BOLD}📋 Validation Summary${NC}"
log_output "${BOLD}===================${NC}"

# Add summary to report
if [[ "$GENERATE_REPORT" == "true" ]]; then
    add_to_report "## Summary"
    add_to_report ""
    add_to_report "| Metric | Count |"
    add_to_report "|--------|-------|"
    add_to_report "| ✅ Passed | $VALIDATIONS_PASSED |"
    add_to_report "| ❌ Failed | $VALIDATIONS_FAILED |"
    add_to_report "| ⚠️ Warnings | $WARNINGS |"
    add_to_report ""
fi

if [ "$VALIDATIONS_FAILED" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        log_output "${GREEN}🎉 All validations passed!${NC}"
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            add_to_report "Status: ✅ ALL PASSED"
        fi
        log_output "${GREEN}✅ Passed: $VALIDATIONS_PASSED${NC}"
        log_output "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
        log_output "${RED}❌ Failed: $VALIDATIONS_FAILED${NC}"
        EXIT_CODE=0
    else
        log_output "${YELLOW}⚠️ Validations passed with warnings${NC}"
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            add_to_report "Status: ⚠️ PASSED WITH WARNINGS"
        fi
        log_output "${GREEN}✅ Passed: $VALIDATIONS_PASSED${NC}"
        log_output "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
        log_output "${RED}❌ Failed: $VALIDATIONS_FAILED${NC}"
        EXIT_CODE=0
    fi
else
    log_output "${RED}❌ Validations failed${NC}"
    if [[ "$GENERATE_REPORT" == "true" ]]; then
        add_to_report "Status: ❌ FAILED"
    fi
    log_output "${GREEN}✅ Passed: $VALIDATIONS_PASSED${NC}"
    log_output "${YELLOW}⚠️ Warnings: $WARNINGS${NC}"
    log_output "${RED}❌ Failed: $VALIDATIONS_FAILED${NC}"
    EXIT_CODE=1
fi

if [[ "$GENERATE_REPORT" == "true" ]]; then
    log_output ""
    log_output "${BOLD}📋 Full report: ${BLUE}$REPORT_FILE${NC}"
fi

# Cleanup temp files
rm -f /tmp/ts-check.log /tmp/lint.log /tmp/build.log /tmp/arch-health.log /tmp/perf-monitor.log

exit $EXIT_CODE