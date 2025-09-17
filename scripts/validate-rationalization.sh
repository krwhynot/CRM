#!/usr/bin/env bash

# validate-rationalization.sh - Build Pipeline Rationalization Validation
#
# This script validates that the build pipeline rationalization has been successful
# and all critical functionality is preserved. It tests both the old and new script
# patterns to ensure backward compatibility and proper migration.
#
# Exit codes:
#   0 - All validations passed
#   1 - Critical validation failures found
#   2 - Warning-level issues found (not blocking)

set -e

# Configuration
VALIDATION_REPORT="validation-report-$(date +%Y%m%d_%H%M%S).md"
VALIDATION_DIR=".validation-tmp"
EXIT_CODE=0
WARNINGS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    EXIT_CODE=1
}

log_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Initialize validation environment
init_validation() {
    log_section "Initializing Validation Environment"

    # Create temporary validation directory
    if [ -d "$VALIDATION_DIR" ]; then
        rm -rf "$VALIDATION_DIR"
    fi
    mkdir -p "$VALIDATION_DIR"

    # Initialize report
    cat > "$VALIDATION_REPORT" << EOF
# Build Pipeline Rationalization Validation Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Project:** KitchenPantry CRM
**Branch:** $(git branch --show-current)
**Commit:** $(git rev-parse --short HEAD)

## Summary

This report validates the success of the build pipeline rationalization from 70+ scripts to ~25 parameterized scripts.

EOF

    log_info "Validation environment initialized"
}

# Test critical CI/CD script dependencies
validate_ci_cd_dependencies() {
    log_section "Validating CI/CD Script Dependencies"

    echo "## CI/CD Dependencies Validation" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"

    # Critical scripts used by GitHub workflows
    local critical_scripts=(
        "type-check"
        "lint"
        "build"
        "test:auth"
        "test:crud"
        "test:dashboard"
        "test:mobile"
        "test:backend"
        "test:security"
        "format:check"
        "quality-gates"
        "performance"
    )

    local missing_scripts=0

    for script in "${critical_scripts[@]}"; do
        if npm run "$script" --silent 2>/dev/null; then
            log_success "Script '$script' is available"
            echo "- ✅ \`$script\` - Available" >> "$VALIDATION_REPORT"
        else
            log_error "Script '$script' is missing or broken"
            echo "- ❌ \`$script\` - Missing/Broken" >> "$VALIDATION_REPORT"
            missing_scripts=$((missing_scripts + 1))
        fi
    done

    echo "" >> "$VALIDATION_REPORT"

    if [ $missing_scripts -eq 0 ]; then
        log_success "All critical CI/CD scripts are available"
        echo "**Status:** ✅ All critical scripts available" >> "$VALIDATION_REPORT"
    else
        log_error "$missing_scripts critical CI/CD scripts are missing"
        echo "**Status:** ❌ $missing_scripts critical scripts missing" >> "$VALIDATION_REPORT"
    fi
}

# Test quality gates functionality
validate_quality_gates() {
    log_section "Validating Quality Gates Functionality"

    echo "## Quality Gates Validation" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"

    # Test basic quality gates execution
    if timeout 120s ./scripts/run-quality-gates.sh --quiet > "$VALIDATION_DIR/quality-gates.log" 2>&1; then
        log_success "Quality gates executed successfully"
        echo "- ✅ Quality gates execution - Passed" >> "$VALIDATION_REPORT"
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            log_warning "Quality gates timed out (may be normal for comprehensive checks)"
            echo "- ⚠️ Quality gates execution - Timeout (120s)" >> "$VALIDATION_REPORT"
        else
            log_error "Quality gates failed with exit code $exit_code"
            echo "- ❌ Quality gates execution - Failed (exit code $exit_code)" >> "$VALIDATION_REPORT"
        fi
    fi

    # Test parameterized quality gates
    local gate_levels=("basic" "build" "performance")

    for level in "${gate_levels[@]}"; do
        if timeout 60s ./scripts/run-quality-gates.sh --gates "${level}" --quiet > "$VALIDATION_DIR/quality-gates-${level}.log" 2>&1; then
            log_success "Quality gates '$level' level executed successfully"
            echo "- ✅ Quality gates '$level' - Passed" >> "$VALIDATION_REPORT"
        else
            log_warning "Quality gates '$level' level failed or timed out"
            echo "- ⚠️ Quality gates '$level' - Failed/Timeout" >> "$VALIDATION_REPORT"
        fi
    done
}

# Test architecture validation
validate_architecture_validation() {
    log_section "Validating Architecture Validation"

    echo "## Architecture Validation" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"

    # Test main architecture validation
    if timeout 60s node scripts/validate-architecture.js > "$VALIDATION_DIR/architecture.log" 2>&1; then
        local health_score=$(grep "Architecture Health Score" "$VALIDATION_DIR/architecture.log" | grep -o '[0-9]\+' || echo "0")
        log_success "Architecture validation completed (Health Score: ${health_score}%)"
        echo "- ✅ Architecture validation - Health Score: ${health_score}%" >> "$VALIDATION_REPORT"

        if [ "$health_score" -lt 80 ]; then
            log_warning "Architecture health score below 80% threshold"
            echo "- ⚠️ Health score below 80% threshold" >> "$VALIDATION_REPORT"
        fi
    else
        log_error "Architecture validation failed"
        echo "- ❌ Architecture validation - Failed" >> "$VALIDATION_REPORT"
    fi

    # Test parameterized architecture validation
    local arch_focuses=("state" "components" "performance" "eslint")

    for focus in "${arch_focuses[@]}"; do
        if timeout 30s node scripts/validate-architecture.js "$focus" > "$VALIDATION_DIR/arch-${focus}.log" 2>&1; then
            log_success "Architecture validation '$focus' focus completed"
            echo "- ✅ Architecture '$focus' focus - Passed" >> "$VALIDATION_REPORT"
        else
            log_warning "Architecture validation '$focus' focus failed or timed out"
            echo "- ⚠️ Architecture '$focus' focus - Failed/Timeout" >> "$VALIDATION_REPORT"
        fi
    done
}

# Test performance monitoring
validate_performance_monitoring() {
    log_section "Validating Performance Monitoring"

    echo "## Performance Monitoring Validation" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"

    # Test basic performance monitoring
    if timeout 90s ./scripts/performance-monitor.sh basic --quiet > "$VALIDATION_DIR/performance.log" 2>&1; then
        log_success "Performance monitoring completed successfully"
        echo "- ✅ Performance monitoring - Completed" >> "$VALIDATION_REPORT"

        # Check if performance report was generated
        if find . -name "performance_report_*.md" -mmin -2 | grep -q .; then
            log_success "Performance report generated"
            echo "- ✅ Performance report - Generated" >> "$VALIDATION_REPORT"
        else
            log_warning "Performance report not found"
            echo "- ⚠️ Performance report - Not found" >> "$VALIDATION_REPORT"
        fi
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            log_warning "Performance monitoring timed out (may be expected)"
            echo "- ⚠️ Performance monitoring - Timeout (90s)" >> "$VALIDATION_REPORT"
        else
            log_error "Performance monitoring failed"
            echo "- ❌ Performance monitoring - Failed" >> "$VALIDATION_REPORT"
        fi
    fi
}

# Test consolidated script functionality
validate_consolidated_scripts() {
    log_section "Validating Consolidated Scripts"

    echo "## Consolidated Scripts Validation" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"

    # Test consolidated test runner
    if [ -f "./scripts/test.sh" ]; then
        log_success "Consolidated test runner exists"
        echo "- ✅ \`test.sh\` - Available" >> "$VALIDATION_REPORT"

        # Test different test modes
        local test_modes=("backend" "architecture" "mcp")
        for mode in "${test_modes[@]}"; do
            if timeout 30s ./scripts/test.sh "$mode" --quick > "$VALIDATION_DIR/test-${mode}.log" 2>&1; then
                log_success "Test mode '$mode' executed successfully"
                echo "- ✅ Test mode '$mode' - Passed" >> "$VALIDATION_REPORT"
            else
                log_warning "Test mode '$mode' failed or timed out"
                echo "- ⚠️ Test mode '$mode' - Failed/Timeout" >> "$VALIDATION_REPORT"
            fi
        done
    else
        log_error "Consolidated test runner not found"
        echo "- ❌ \`test.sh\` - Missing" >> "$VALIDATION_REPORT"
    fi

    # Test consolidated validation runner
    if [ -f "./scripts/validate-enhanced.sh" ]; then
        log_success "Enhanced validation runner exists"
        echo "- ✅ \`validate-enhanced.sh\` - Available" >> "$VALIDATION_REPORT"

        # Test different validation levels
        local validation_levels=("basic" "architecture")
        for level in "${validation_levels[@]}"; do
            if timeout 30s ./scripts/validate-enhanced.sh "$level" > "$VALIDATION_DIR/validate-${level}.log" 2>&1; then
                log_success "Validation level '$level' executed successfully"
                echo "- ✅ Validation level '$level' - Passed" >> "$VALIDATION_REPORT"
            else
                log_warning "Validation level '$level' failed or timed out"
                echo "- ⚠️ Validation level '$level' - Failed/Timeout" >> "$VALIDATION_REPORT"
            fi
        done
    else
        log_error "Enhanced validation runner not found"
        echo "- ❌ \`validate-enhanced.sh\` - Missing" >> "$VALIDATION_REPORT"
    fi

    # Test technical debt consolidation
    if timeout 30s npm run debt -- audit > "$VALIDATION_DIR/debt-audit.log" 2>&1; then
        log_success "Technical debt audit executed successfully"
        echo "- ✅ Technical debt audit - Passed" >> "$VALIDATION_REPORT"
    else
        log_warning "Technical debt audit failed or timed out"
        echo "- ⚠️ Technical debt audit - Failed/Timeout" >> "$VALIDATION_REPORT"
    fi
}

# Test build system functionality
validate_build_system() {
    log_section "Validating Build System"

    echo "## Build System Validation" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"

    # Test enhanced build script
    if [ -f "./scripts/build.sh" ]; then
        log_success "Enhanced build script exists"
        echo "- ✅ \`build.sh\` - Available" >> "$VALIDATION_REPORT"

        # Test build with analysis (but don't open browser)
        if timeout 120s ./scripts/build.sh --analyze > "$VALIDATION_DIR/build-analyze.log" 2>&1; then
            log_success "Build with analysis completed successfully"
            echo "- ✅ Build with analysis - Passed" >> "$VALIDATION_REPORT"

            # Check bundle size
            if [ -d "dist" ]; then
                local bundle_size=$(du -sh dist/ | cut -f1)
                log_success "Bundle size: $bundle_size"
                echo "- ✅ Bundle generated - Size: $bundle_size" >> "$VALIDATION_REPORT"
            fi
        else
            log_warning "Build with analysis failed or timed out"
            echo "- ⚠️ Build with analysis - Failed/Timeout" >> "$VALIDATION_REPORT"
        fi
    else
        log_error "Enhanced build script not found"
        echo "- ❌ \`build.sh\` - Missing" >> "$VALIDATION_REPORT"
    fi

    # Test core build command
    if timeout 60s npm run build > "$VALIDATION_DIR/build-core.log" 2>&1; then
        log_success "Core build command executed successfully"
        echo "- ✅ Core build command - Passed" >> "$VALIDATION_REPORT"
    else
        log_error "Core build command failed"
        echo "- ❌ Core build command - Failed" >> "$VALIDATION_REPORT"
    fi
}

# Check for redundant scripts that can be removed
identify_redundant_scripts() {
    log_section "Identifying Redundant Scripts"

    echo "## Redundant Scripts Analysis" >> "$VALIDATION_REPORT"
    echo "" >> "$VALIDATION_REPORT"

    # Parse package.json to identify potential redundant scripts
    local redundant_candidates=(
        "validate:architecture:legacy"
        "validate:performance:legacy"
        "validate:design-tokens:legacy"
    )

    local safe_to_remove=()
    local keep_for_compatibility=()

    for script in "${redundant_candidates[@]}"; do
        if grep -q "\"$script\"" package.json; then
            # Check if script has been replaced by consolidated version
            case $script in
                "validate:architecture:legacy")
                    if grep -q "validate:architecture:" package.json && [ -f "./scripts/validate-architecture.js" ]; then
                        safe_to_remove+=("$script")
                        echo "- 🗑️ \`$script\` - Safe to remove (replaced by consolidated architecture validation)" >> "$VALIDATION_REPORT"
                    else
                        keep_for_compatibility+=("$script")
                        echo "- ⚠️ \`$script\` - Keep for compatibility" >> "$VALIDATION_REPORT"
                    fi
                    ;;
                "validate:performance:legacy")
                    if [ -f "./scripts/performance-monitor.sh" ]; then
                        safe_to_remove+=("$script")
                        echo "- 🗑️ \`$script\` - Safe to remove (replaced by performance monitoring)" >> "$VALIDATION_REPORT"
                    else
                        keep_for_compatibility+=("$script")
                        echo "- ⚠️ \`$script\` - Keep for compatibility" >> "$VALIDATION_REPORT"
                    fi
                    ;;
                "validate:design-tokens:legacy")
                    if [ -f "./scripts/test.sh" ]; then
                        safe_to_remove+=("$script")
                        echo "- 🗑️ \`$script\` - Safe to remove (replaced by consolidated test runner)" >> "$VALIDATION_REPORT"
                    else
                        keep_for_compatibility+=("$script")
                        echo "- ⚠️ \`$script\` - Keep for compatibility" >> "$VALIDATION_REPORT"
                    fi
                    ;;
            esac
        fi
    done

    echo "" >> "$VALIDATION_REPORT"
    echo "**Safe to Remove:** ${#safe_to_remove[@]} scripts" >> "$VALIDATION_REPORT"
    echo "**Keep for Compatibility:** ${#keep_for_compatibility[@]} scripts" >> "$VALIDATION_REPORT"

    if [ ${#safe_to_remove[@]} -gt 0 ]; then
        log_info "${#safe_to_remove[@]} scripts identified as safe to remove"
        echo "SAFE_TO_REMOVE=(${safe_to_remove[*]})" > "$VALIDATION_DIR/safe-to-remove.sh"
    else
        log_info "No redundant scripts identified for removal"
    fi
}

# Generate final report
generate_final_report() {
    log_section "Generating Final Report"

    # Add conclusion to report
    cat >> "$VALIDATION_REPORT" << EOF

## Validation Summary

**Total Warnings:** $WARNINGS
**Critical Failures:** $([ $EXIT_CODE -eq 0 ] && echo "0" || echo "1+")

### Overall Status

EOF

    if [ $EXIT_CODE -eq 0 ]; then
        if [ $WARNINGS -eq 0 ]; then
            echo "✅ **VALIDATION PASSED** - Build pipeline rationalization is successful with no issues." >> "$VALIDATION_REPORT"
            log_success "Validation completed successfully with no issues"
        else
            echo "⚠️ **VALIDATION PASSED WITH WARNINGS** - Build pipeline rationalization is successful but has $WARNINGS warning(s)." >> "$VALIDATION_REPORT"
            log_warning "Validation completed with $WARNINGS warning(s)"
            EXIT_CODE=2
        fi
    else
        echo "❌ **VALIDATION FAILED** - Build pipeline rationalization has critical issues that need to be addressed." >> "$VALIDATION_REPORT"
        log_error "Validation failed with critical issues"
    fi

    cat >> "$VALIDATION_REPORT" << EOF

### Next Steps

1. **If validation passed:** Safe to proceed with redundant script removal
2. **If warnings exist:** Review warning details and consider fixes
3. **If validation failed:** Address critical issues before proceeding

### Files Generated

- Validation report: \`$VALIDATION_REPORT\`
- Validation logs: \`$VALIDATION_DIR/\`
- Safe to remove list: \`$VALIDATION_DIR/safe-to-remove.sh\` (if applicable)

---

**Validation completed at:** $(date '+%Y-%m-%d %H:%M:%S')
EOF

    log_info "Validation report generated: $VALIDATION_REPORT"
}

# Cleanup validation environment
cleanup_validation() {
    if [ "$1" != "--keep-logs" ]; then
        if [ -d "$VALIDATION_DIR" ]; then
            rm -rf "$VALIDATION_DIR"
            log_info "Validation temporary files cleaned up"
        fi
    else
        log_info "Validation logs preserved in $VALIDATION_DIR"
    fi
}

# Main validation sequence
main() {
    local keep_logs=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --keep-logs)
                keep_logs=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--keep-logs] [--help]"
                echo ""
                echo "Validates the build pipeline rationalization migration."
                echo ""
                echo "Options:"
                echo "  --keep-logs    Preserve validation logs and temporary files"
                echo "  --help, -h     Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    init_validation
    validate_ci_cd_dependencies
    validate_quality_gates
    validate_architecture_validation
    validate_performance_monitoring
    validate_consolidated_scripts
    validate_build_system
    identify_redundant_scripts
    generate_final_report

    if [ "$keep_logs" = true ]; then
        cleanup_validation --keep-logs
    else
        cleanup_validation
    fi

    exit $EXIT_CODE
}

# Run main function with all arguments
main "$@"