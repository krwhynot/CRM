#!/bin/bash

# Consolidated Validation Runner - Unified validation execution with parameter support
# Supports TypeScript, linting, architecture, performance, and build validation
# Part of Build Pipeline Rationalization Plan - Task 1.1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage information
show_usage() {
    echo "Usage: $0 [validation-type] [options]"
    echo ""
    echo "Validation Types (default: basic):"
    echo "  basic                      - Type check, lint, and build (equivalent to npm run validate)"
    echo "  architecture               - Architecture validation and health scoring"
    echo "  performance                - Performance baseline validation"
    echo "  design-tokens              - Design token consistency validation"
    echo "  full                       - Complete validation including quality gates"
    echo "  quality-gates              - Run 7-stage quality pipeline"
    echo ""
    echo "Architecture Options:"
    echo "  --focus <area>             - Focus on specific area: state, components, performance, eslint"
    echo "  --health-threshold <num>   - Set health score threshold (default: 80)"
    echo ""
    echo "Performance Options:"
    echo "  --timeout <seconds>        - Set timeout for performance monitoring (default: 60)"
    echo ""
    echo "Examples:"
    echo "  $0                         - Run basic validation"
    echo "  $0 architecture            - Run architecture validation"
    echo "  $0 architecture --focus state - Focus on state boundary validation"
    echo "  $0 performance             - Run performance validation"
    echo "  $0 full                    - Run complete validation suite"
}

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Basic validation (type-check + lint + build)
run_basic_validation() {
    log_info "Running basic validation (type-check + lint + build)..."

    local exit_code=0

    # Type checking
    log_info "Running TypeScript type checking..."
    if ! npm run type-check; then
        log_error "Type checking failed"
        exit_code=1
    else
        log_success "Type checking passed"
    fi

    # Linting
    log_info "Running ESLint validation..."
    if ! npm run lint; then
        log_error "Linting failed"
        exit_code=1
    else
        log_success "Linting passed"
    fi

    # Build
    log_info "Running build validation..."
    if ! npm run build; then
        log_error "Build failed"
        exit_code=1
    else
        log_success "Build passed"
    fi

    return $exit_code
}

# Architecture validation
run_architecture_validation() {
    local focus_area="$1"
    local health_threshold="${2:-80}"

    log_info "Running architecture validation..."

    local exit_code=0

    # Run architecture health scoring
    log_info "Running architecture health validation (threshold: ${health_threshold}%)..."
    if ! node scripts/validate-architecture.js --threshold="$health_threshold"; then
        log_error "Architecture health validation failed"
        exit_code=1
    else
        log_success "Architecture health validation passed"
    fi

    # Run architecture tests based on focus
    if [ -n "$focus_area" ]; then
        log_info "Running focused architecture tests: $focus_area"
        if ! ./scripts/test.sh architecture "$focus_area"; then
            log_error "Architecture tests failed for focus area: $focus_area"
            exit_code=1
        else
            log_success "Architecture tests passed for focus area: $focus_area"
        fi
    else
        log_info "Running all architecture tests..."
        if ! ./scripts/test.sh architecture; then
            log_error "Architecture tests failed"
            exit_code=1
        else
            log_success "Architecture tests passed"
        fi
    fi

    return $exit_code
}

# Performance validation
run_performance_validation() {
    local timeout="${1:-60}"

    log_info "Running performance validation (timeout: ${timeout}s)..."

    # Export timeout for performance monitor script
    export PERFORMANCE_TIMEOUT="$timeout"

    if ! ./scripts/performance-monitor.sh; then
        log_error "Performance validation failed"
        return 1
    else
        log_success "Performance validation passed"
        return 0
    fi
}

# Design token validation
run_design_token_validation() {
    log_info "Running design token validation..."

    local exit_code=0

    # Run design token validation script
    if command -v ./scripts/validate-design-tokens.sh >/dev/null 2>&1; then
        if ! ./scripts/validate-design-tokens.sh; then
            log_error "Design token validation script failed"
            exit_code=1
        else
            log_success "Design token validation script passed"
        fi
    else
        log_warning "Design token validation script not found, running test suite instead"
    fi

    # Run design token tests
    if ! ./scripts/test.sh design-tokens; then
        log_error "Design token tests failed"
        exit_code=1
    else
        log_success "Design token tests passed"
    fi

    return $exit_code
}

# Full validation suite
run_full_validation() {
    log_info "Running complete validation suite..."

    local exit_code=0

    # Basic validation
    if ! run_basic_validation; then
        log_error "Basic validation failed"
        exit_code=1
    fi

    # Architecture validation
    if ! run_architecture_validation; then
        log_error "Architecture validation failed"
        exit_code=1
    fi

    # Performance validation
    if ! run_performance_validation; then
        log_error "Performance validation failed"
        exit_code=1
    fi

    # Design token validation
    if ! run_design_token_validation; then
        log_error "Design token validation failed"
        exit_code=1
    fi

    if [ $exit_code -eq 0 ]; then
        log_success "Complete validation suite passed"
    else
        log_error "Complete validation suite failed"
    fi

    return $exit_code
}

# Quality gates validation
run_quality_gates() {
    log_info "Running 7-stage quality pipeline..."

    if ! ./scripts/run-quality-gates.sh; then
        log_error "Quality gates failed"
        return 1
    else
        log_success "Quality gates passed"
        return 0
    fi
}

# Parse arguments
parse_arguments() {
    local validation_type="${1:-basic}"
    shift

    local focus_area=""
    local health_threshold="80"
    local timeout="60"

    while [[ $# -gt 0 ]]; do
        case $1 in
            --focus)
                focus_area="$2"
                shift 2
                ;;
            --health-threshold)
                health_threshold="$2"
                shift 2
                ;;
            --timeout)
                timeout="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    case "$validation_type" in
        "basic"|"")
            run_basic_validation
            ;;
        "architecture")
            run_architecture_validation "$focus_area" "$health_threshold"
            ;;
        "performance")
            run_performance_validation "$timeout"
            ;;
        "design-tokens")
            run_design_token_validation
            ;;
        "full")
            run_full_validation
            ;;
        "quality-gates")
            run_quality_gates
            ;;
        "help"|"-h"|"--help")
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown validation type: $validation_type"
            show_usage
            exit 1
            ;;
    esac
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        # Default to basic validation if no arguments
        run_basic_validation
    else
        parse_arguments "$@"
    fi
}

# Run main function with all arguments
main "$@"