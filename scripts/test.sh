#!/bin/bash

# Unified Test Runner - Consolidated test execution with parameter support
# Supports backend, architecture, migration, and design token testing
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
    echo "Usage: $0 <test-type> [options]"
    echo ""
    echo "Test Types:"
    echo "  backend [focus] [mode]     - Run backend tests"
    echo "  architecture [focus]       - Run architecture validation tests"
    echo "  migration [mode]           - Run migration tests"
    echo "  design-tokens [mode]       - Run design token tests"
    echo "  mcp [suite]                - Run MCP integration tests"
    echo ""
    echo "Backend Focus Areas:"
    echo "  db|database                - Database tests"
    echo "  performance                - Performance tests"
    echo "  security                   - Security tests"
    echo "  integrity                  - Data integrity tests"
    echo "  imports|import             - Import functionality tests"
    echo "  hooks                      - React hook tests"
    echo "  (none)                     - All backend tests (default)"
    echo ""
    echo "Backend Modes:"
    echo "  coverage                   - Run with coverage reporting"
    echo "  watch                      - Run in watch mode"
    echo "  verbose                    - Run with verbose output"
    echo ""
    echo "Architecture Focus Areas:"
    echo "  state                      - State boundary validation"
    echo "  components                 - Component placement validation"
    echo "  performance                - Performance pattern validation"
    echo "  eslint                     - ESLint rule validation"
    echo ""
    echo "Migration Modes:"
    echo "  parity                     - Run parity checks"
    echo "  watch                      - Run in watch mode"
    echo ""
    echo "Design Token Modes:"
    echo "  visual                     - Visual regression tests"
    echo "  contracts                  - Token contract validation"
    echo "  consistency                - Token consistency validation"
    echo "  hierarchy                  - Token hierarchy validation"
    echo "  contrast                   - Enhanced WCAG contrast validation (TypeScript + shell)"
    echo "  duplication                - Duplication detection tests"
    echo "  ui-compliance              - Comprehensive UI compliance (lint + tokens + WCAG)"
    echo "  full|all                   - Complete design token validation suite"
    echo "  (none)                     - Run all design token tests (default)"
    echo ""
    echo "MCP Test Suites:"
    echo "  auth                       - Authentication tests"
    echo "  crud                       - CRUD operation tests"
    echo "  dashboard                  - Dashboard functionality tests"
    echo "  mobile                     - Mobile responsiveness tests"
    echo ""
    echo "Examples:"
    echo "  $0 backend                 - Run all backend tests"
    echo "  $0 backend db coverage     - Run database tests with coverage"
    echo "  $0 architecture state      - Run state boundary validation"
    echo "  $0 migration parity        - Run migration parity checks"
    echo "  $0 design-tokens visual      - Run visual regression tests"
    echo "  $0 design-tokens contrast    - Run enhanced WCAG contrast validation"
    echo "  $0 design-tokens hierarchy   - Run token hierarchy tests"
    echo "  $0 design-tokens ui-compliance - Run comprehensive UI compliance suite"
    echo "  $0 design-tokens full        - Run complete design token validation"
    echo "  $0 mcp auth                - Run authentication MCP tests"
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

# Backend test runner
run_backend_tests() {
    local focus="$1"
    local mode="$2"
    local param3="$3"

    log_info "Running backend tests..."

    # Determine test command based on focus
    local test_cmd="vitest run tests/backend"
    local test_description="all backend tests"

    # Handle --mode parameter format
    if [[ "$focus" == "--mode" ]]; then
        mode="$mode"
        focus=""
    elif [[ "$mode" == "--mode" ]]; then
        mode="$param3"
    fi

    case "$focus" in
        "db"|"database")
            test_cmd="vitest run tests/backend/database"
            test_description="database tests"
            ;;
        "performance")
            test_cmd="vitest run tests/backend/performance"
            test_description="performance tests"
            ;;
        "security")
            test_cmd="vitest run tests/backend/security"
            test_description="security tests"
            ;;
        "integrity")
            test_cmd="vitest run tests/backend/integrity"
            test_description="integrity tests"
            ;;
        "imports"|"import")
            test_cmd="vitest run tests/backend/imports"
            test_description="import tests"
            ;;
        "hooks")
            test_cmd="vitest run tests/backend/hooks"
            test_description="hook tests"
            ;;
        "")
            # Default: all backend tests
            test_cmd="vitest run tests/backend"
            test_description="all backend tests"
            ;;
        *)
            log_warning "Unknown backend focus area: $focus, running all backend tests"
            test_cmd="vitest run tests/backend"
            test_description="all backend tests"
            ;;
    esac

    # Apply mode modifications
    case "$mode" in
        "coverage")
            test_cmd="$test_cmd --coverage"
            test_description="$test_description with coverage"
            ;;
        "watch")
            test_cmd=$(echo "$test_cmd" | sed 's/run//')
            test_description="$test_description in watch mode"
            ;;
        "verbose")
            test_cmd="$test_cmd --reporter=verbose"
            test_description="$test_description with verbose output"
            ;;
        "")
            # Default: no mode modifications
            ;;
        *)
            log_warning "Unknown backend mode: $mode, proceeding with standard execution"
            ;;
    esac

    log_info "Executing: $test_cmd ($test_description)"

    if $test_cmd; then
        log_success "Backend tests completed successfully"
        return 0
    else
        log_error "Backend tests failed"
        return 1
    fi
}

# Architecture test runner
run_architecture_tests() {
    local focus="$1"

    log_info "Running architecture tests..."

    # Determine test command based on focus
    local test_cmd="vitest run tests/architecture"
    local test_description="all architecture tests"

    case "$focus" in
        "state")
            test_cmd="vitest run tests/architecture/state-boundaries.test.ts"
            test_description="state boundary validation"
            ;;
        "components")
            test_cmd="vitest run tests/architecture/component-placement.test.ts"
            test_description="component placement validation"
            ;;
        "performance")
            test_cmd="vitest run tests/architecture/performance-patterns.test.ts"
            test_description="performance pattern validation"
            ;;
        "eslint")
            test_cmd="vitest run tests/architecture/eslint-rules.test.ts"
            test_description="ESLint rule validation"
            ;;
    esac

    log_info "Executing: $test_cmd ($test_description)"

    if $test_cmd; then
        log_success "Architecture tests completed successfully"
        return 0
    else
        log_error "Architecture tests failed"
        return 1
    fi
}

# Migration test runner
run_migration_tests() {
    local mode="$1"

    log_info "Running migration tests..."

    local test_cmd="vitest run tests/migration"
    local test_description="migration tests"

    case "$mode" in
        "parity")
            test_cmd="vitest run tests/migration/zod-validation-consistency.test.ts"
            test_description="migration parity checks"
            ;;
        "watch")
            test_cmd="vitest tests/migration"
            test_description="migration tests in watch mode"
            ;;
    esac

    log_info "Executing: $test_cmd ($test_description)"

    if $test_cmd; then
        log_success "Migration tests completed successfully"
        return 0
    else
        log_error "Migration tests failed"
        return 1
    fi
}

# Design token test runner
run_design_token_tests() {
    local mode="$1"
    local param2="$2"

    log_info "Running design token tests..."

    local test_cmd="vitest run tests/design-tokens"
    local test_description="design token tests"
    local shell_validation=false
    local combined_validation=false

    case "$mode" in
        "visual")
            # Check if visual regression test exists, fallback if not
            if [ -f "tests/design-tokens/visual-regression.test.ts" ]; then
                test_cmd="vitest run tests/design-tokens/visual-regression.test.ts"
                test_description="visual regression tests"
            else
                log_warning "Visual regression test not found, running all design token tests"
            fi
            ;;
        "contracts")
            test_cmd="vitest run tests/design-tokens/token-contract.test.ts"
            test_description="token contract validation"
            ;;
        "consistency")
            test_cmd="vitest run tests/design-tokens/token-consistency.test.ts"
            test_description="token consistency validation"
            ;;
        "hierarchy")
            test_cmd="vitest run tests/design-tokens/hierarchy-validation.test.ts"
            test_description="token hierarchy validation"
            ;;
        "contrast")
            # Enhanced contrast validation - both TypeScript and shell-based
            combined_validation=true
            test_description="enhanced WCAG contrast validation"
            ;;
        "duplication")
            test_cmd="vitest run tests/design-tokens/duplication-detection.test.ts"
            test_description="duplication detection tests"
            ;;
        "ui-compliance")
            # Comprehensive UI compliance validation
            combined_validation=true
            test_description="comprehensive UI compliance validation"
            ;;
        "full"|"all")
            # Run complete design token test suite
            combined_validation=true
            test_description="complete design token validation suite"
            ;;
        "")
            # Default: run all tests
            combined_validation=true
            test_description="all design token tests"
            ;;
    esac

    # Handle combined/enhanced validations
    if [ "$combined_validation" = true ]; then
        case "$mode" in
            "contrast")
                log_info "Running enhanced WCAG contrast validation..."
                local success=0

                # Run TypeScript-based contrast tests
                log_info "1/2: Running TypeScript contrast validation..."
                if vitest run tests/design-tokens/contrast-validation.test.ts; then
                    log_success "TypeScript contrast validation passed"
                else
                    log_error "TypeScript contrast validation failed"
                    success=1
                fi

                # Run shell-based comprehensive validation
                log_info "2/2: Running shell-based WCAG validation..."
                if ./scripts/validate-design-tokens.sh; then
                    log_success "Shell-based WCAG validation passed"
                else
                    log_error "Shell-based WCAG validation failed"
                    success=1
                fi

                if [ $success -eq 0 ]; then
                    log_success "Enhanced contrast validation completed successfully"
                    return 0
                else
                    log_error "Enhanced contrast validation failed"
                    return 1
                fi
                ;;
            "ui-compliance")
                log_info "Running comprehensive UI compliance validation..."
                local success=0

                # 1. Lint validation
                log_info "1/4: Running UI lint validation..."
                if npm run lint:ui; then
                    log_success "UI lint validation passed"
                else
                    log_error "UI lint validation failed"
                    success=1
                fi

                # 2. Design token contract validation
                log_info "2/4: Running design token contract validation..."
                if vitest run tests/design-tokens/token-contract.test.ts; then
                    log_success "Token contract validation passed"
                else
                    log_error "Token contract validation failed"
                    success=1
                fi

                # 3. Token hierarchy validation
                log_info "3/4: Running token hierarchy validation..."
                if vitest run tests/design-tokens/hierarchy-validation.test.ts; then
                    log_success "Token hierarchy validation passed"
                else
                    log_error "Token hierarchy validation failed"
                    success=1
                fi

                # 4. Comprehensive WCAG validation
                log_info "4/4: Running comprehensive WCAG validation..."
                if ./scripts/validate-design-tokens.sh; then
                    log_success "WCAG validation passed"
                else
                    log_error "WCAG validation failed"
                    success=1
                fi

                if [ $success -eq 0 ]; then
                    log_success "Comprehensive UI compliance validation completed successfully"
                    return 0
                else
                    log_error "Comprehensive UI compliance validation failed"
                    return 1
                fi
                ;;
            "full"|"all"|"")
                log_info "Running complete design token validation suite..."
                local success=0

                # Run all design token tests
                log_info "1/2: Running all TypeScript design token tests..."
                if vitest run tests/design-tokens; then
                    log_success "TypeScript design token tests passed"
                else
                    log_error "TypeScript design token tests failed"
                    success=1
                fi

                # Run comprehensive shell validation
                log_info "2/2: Running comprehensive shell validation..."
                if ./scripts/validate-design-tokens.sh; then
                    log_success "Shell validation passed"
                else
                    log_error "Shell validation failed"
                    success=1
                fi

                if [ $success -eq 0 ]; then
                    log_success "Complete design token validation suite completed successfully"
                    return 0
                else
                    log_error "Complete design token validation suite failed"
                    return 1
                fi
                ;;
        esac
    else
        # Single test execution
        log_info "Executing: $test_cmd ($test_description)"

        if [ "$shell_validation" = true ]; then
            # For shell-based validation, execute directly
            if $test_cmd; then
                log_success "Design token tests completed successfully"
                return 0
            else
                log_error "Design token tests failed"
                return 1
            fi
        else
            # For vitest-based tests
            if $test_cmd; then
                log_success "Design token tests completed successfully"
                return 0
            else
                log_error "Design token tests failed"
                return 1
            fi
        fi
    fi
}

# MCP test runner
run_mcp_tests() {
    local suite="$1"

    log_info "Running MCP tests..."

    local test_cmd="node tests/mcp/run-all.js"
    local test_description="all MCP tests"

    case "$suite" in
        "auth")
            test_cmd="node tests/mcp/auth.mcp.js"
            test_description="authentication tests"
            ;;
        "crud")
            test_cmd="node tests/mcp/crud.mcp.js"
            test_description="CRUD operation tests"
            ;;
        "dashboard")
            test_cmd="node tests/mcp/dashboard.mcp.js"
            test_description="dashboard functionality tests"
            ;;
        "mobile")
            test_cmd="node tests/mcp/mobile.mcp.js"
            test_description="mobile responsiveness tests"
            ;;
    esac

    log_info "Executing: $test_cmd ($test_description)"

    if $test_cmd; then
        log_success "MCP tests completed successfully"
        return 0
    else
        log_error "MCP tests failed"
        return 1
    fi
}

# Main execution
main() {
    local test_type="$1"
    local param1="$2"
    local param2="$3"
    local param3="$4"

    if [ -z "$test_type" ]; then
        show_usage
        exit 1
    fi

    case "$test_type" in
        "backend")
            run_backend_tests "$param1" "$param2" "$param3"
            ;;
        "architecture")
            run_architecture_tests "$param1"
            ;;
        "migration")
            run_migration_tests "$param1"
            ;;
        "design-tokens")
            run_design_token_tests "$param1"
            ;;
        "mcp")
            run_mcp_tests "$param1"
            ;;
        "help"|"-h"|"--help")
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown test type: $test_type"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"