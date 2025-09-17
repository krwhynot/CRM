#!/bin/bash

# Enhanced MCP Test Runner
# Provides parameterized execution of MCP test suites with enhanced logging and reporting
# Maintains backward compatibility with individual test commands

set -e

# Default configuration
DEFAULT_SUITE="all"
DEFAULT_MODE="standard"
DEFAULT_FORMAT="standard"
DEFAULT_TIMEOUT=300000
VERBOSE=false
HELP=false
CI_MODE=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display help
show_help() {
    echo "Enhanced MCP Test Runner"
    echo ""
    echo "USAGE:"
    echo "  $0 [SUITE] [OPTIONS]"
    echo ""
    echo "SUITES:"
    echo "  all           Run all MCP test suites (default)"
    echo "  auth          Authentication flow tests"
    echo "  crud          CRUD operations tests"
    echo "  dashboard     Dashboard functionality tests"
    echo "  mobile        Mobile responsiveness tests"
    echo ""
    echo "OPTIONS:"
    echo "  --mode MODE           Execution mode: standard, ci, watch (default: standard)"
    echo "  --format FORMAT       Output format: standard, json, ci (default: standard)"
    echo "  --timeout SECONDS     Test timeout in seconds (default: 300)"
    echo "  --verbose, -v         Enable verbose logging"
    echo "  --ci                  Enable CI mode with structured output"
    echo "  --help, -h            Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0                    # Run all tests with standard output"
    echo "  $0 auth               # Run authentication tests only"
    echo "  $0 all --verbose      # Run all tests with verbose output"
    echo "  $0 crud --ci          # Run CRUD tests in CI mode"
    echo "  $0 mobile --timeout 600  # Run mobile tests with 10-minute timeout"
    echo ""
    echo "ENVIRONMENT VARIABLES:"
    echo "  MCP_TEST_MODE         Override execution mode"
    echo "  MCP_TEST_VERBOSE      Enable verbose logging (true/false)"
    echo "  MCP_TEST_FORMAT       Override output format"
    echo "  MCP_TEST_TIMEOUT      Override timeout in milliseconds"
    echo ""
    echo "CI/CD COMPATIBILITY:"
    echo "  Individual test commands are preserved for CI workflows:"
    echo "  - npm run test:auth"
    echo "  - npm run test:crud"
    echo "  - npm run test:dashboard"
    echo "  - npm run test:mobile"
}

# Function to log messages with timestamps and formatting
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        "INFO")
            if [[ "$VERBOSE" == "true" || "$CI_MODE" == "true" ]]; then
                echo -e "${BLUE}[INFO]${NC} [$timestamp] $message"
            fi
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} [$timestamp] $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} [$timestamp] $message" >&2
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} [$timestamp] $message"
            ;;
        "CI")
            if [[ "$CI_MODE" == "true" ]]; then
                case "$level" in
                    "ERROR") echo "::error::$message" ;;
                    "WARN") echo "::warning::$message" ;;
                    *) echo "::notice::$message" ;;
                esac
            fi
            ;;
    esac
}

# Function to validate environment and dependencies
validate_environment() {
    log_message "INFO" "Validating test environment..."

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        log_message "ERROR" "Node.js is required but not installed"
        exit 1
    fi

    # Check for test runner
    if [[ ! -f "tests/mcp/run-all.js" ]]; then
        log_message "ERROR" "MCP test runner not found: tests/mcp/run-all.js"
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node --version)
    log_message "INFO" "Using Node.js version: $NODE_VERSION"

    # Validate suite parameter
    if [[ "$SUITE" != "all" && "$SUITE" != "auth" && "$SUITE" != "crud" && "$SUITE" != "dashboard" && "$SUITE" != "mobile" ]]; then
        log_message "ERROR" "Invalid test suite: $SUITE"
        log_message "ERROR" "Valid suites: all, auth, crud, dashboard, mobile"
        exit 1
    fi

    log_message "SUCCESS" "Environment validation completed"
}

# Function to set environment variables for test execution
setup_test_environment() {
    log_message "INFO" "Setting up test environment variables..."

    # Set environment variables based on parameters
    export MCP_TEST_MODE="$MODE"
    export MCP_TEST_VERBOSE="$VERBOSE"
    export MCP_TEST_FORMAT="$FORMAT"
    export MCP_TEST_TIMEOUT="$TIMEOUT"

    # CI-specific environment setup
    if [[ "$CI_MODE" == "true" ]]; then
        export MCP_TEST_MODE="ci"
        export MCP_TEST_FORMAT="ci"
        log_message "INFO" "CI mode enabled with structured output"
    fi

    log_message "SUCCESS" "Test environment configured"
}

# Function to execute MCP tests
execute_tests() {
    log_message "INFO" "Starting MCP test execution..."
    log_message "INFO" "Suite: $SUITE | Mode: $MODE | Format: $FORMAT | Timeout: ${TIMEOUT}ms"

    local start_time=$(date +%s)
    local test_command="node tests/mcp/run-all.js"

    # Add suite parameter if not running all tests
    if [[ "$SUITE" != "all" ]]; then
        test_command="$test_command $SUITE"
    fi

    # Add verbose flag if enabled
    if [[ "$VERBOSE" == "true" ]]; then
        test_command="$test_command --verbose"
    fi

    log_message "INFO" "Executing: $test_command"

    # Execute the test command
    if eval "$test_command"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_message "SUCCESS" "MCP tests completed successfully in ${duration}s"
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_message "ERROR" "MCP tests failed after ${duration}s"
        return 1
    fi
}

# Function to generate test report
generate_report() {
    local exit_code="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo ""
    echo "=========================================="
    echo "MCP Test Execution Summary"
    echo "=========================================="
    echo "Timestamp: $timestamp"
    echo "Suite: $SUITE"
    echo "Mode: $MODE"
    echo "Format: $FORMAT"
    echo "Verbose: $VERBOSE"
    echo "Timeout: ${TIMEOUT}ms"

    if [[ "$exit_code" -eq 0 ]]; then
        echo -e "Status: ${GREEN}PASSED${NC}"
        echo "All tests completed successfully"
    else
        echo -e "Status: ${RED}FAILED${NC}"
        echo "Some tests failed - check output above"
    fi

    echo "=========================================="

    # CI-specific output
    if [[ "$CI_MODE" == "true" ]]; then
        if [[ "$exit_code" -eq 0 ]]; then
            echo "::notice::MCP tests passed for suite: $SUITE"
        else
            echo "::error::MCP tests failed for suite: $SUITE"
        fi
    fi
}

# Parse command line arguments
SUITE="$DEFAULT_SUITE"
MODE="$DEFAULT_MODE"
FORMAT="$DEFAULT_FORMAT"
TIMEOUT="$DEFAULT_TIMEOUT"

while [[ $# -gt 0 ]]; do
    case $1 in
        auth|crud|dashboard|mobile|all)
            SUITE="$1"
            shift
            ;;
        --mode)
            MODE="$2"
            shift 2
            ;;
        --format)
            FORMAT="$2"
            shift 2
            ;;
        --timeout)
            TIMEOUT="$(($2 * 1000))" # Convert seconds to milliseconds
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        --help|-h)
            HELP=true
            shift
            ;;
        *)
            log_message "ERROR" "Unknown argument: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check for help flag
if [[ "$HELP" == "true" ]]; then
    show_help
    exit 0
fi

# Override with environment variables if set
[[ -n "$MCP_TEST_MODE" ]] && MODE="$MCP_TEST_MODE"
[[ "$MCP_TEST_VERBOSE" == "true" ]] && VERBOSE=true
[[ -n "$MCP_TEST_FORMAT" ]] && FORMAT="$MCP_TEST_FORMAT"
[[ -n "$MCP_TEST_TIMEOUT" ]] && TIMEOUT="$MCP_TEST_TIMEOUT"

# Main execution flow
main() {
    log_message "INFO" "🚀 Enhanced MCP Test Runner Starting"

    validate_environment
    setup_test_environment

    if execute_tests; then
        generate_report 0
        log_message "SUCCESS" "✅ MCP test execution completed successfully"
        exit 0
    else
        generate_report 1
        log_message "ERROR" "❌ MCP test execution failed"
        exit 1
    fi
}

# Execute main function
main