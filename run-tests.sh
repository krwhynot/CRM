#!/bin/bash

# KitchenPantry CRM - Comprehensive Test Runner
# This script runs the complete Playwright test suite with various options

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
RUN_MODE="all"
BROWSER="chromium"
HEADED=false
DEBUG=false
REPORT=true
SCREENSHOT=false
VIDEO=false
TRACE=false
WORKERS="auto"
RETRIES=1

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE          Test mode: all, auth, crud, dashboard, import, mobile, forms, smoke"
    echo "  -b, --browser BROWSER    Browser: chromium, firefox, webkit, all"
    echo "  -d, --device DEVICE      Device: desktop, ipad, mobile, all"
    echo "  -h, --headed             Run in headed mode"
    echo "  -D, --debug              Run in debug mode"
    echo "  --no-report              Skip generating HTML report"
    echo "  -s, --screenshot         Take screenshots on failure"
    echo "  -v, --video              Record videos"
    echo "  -t, --trace              Enable trace collection"
    echo "  -w, --workers WORKERS    Number of parallel workers (default: auto)"
    echo "  -r, --retries RETRIES    Number of retries (default: 1)"
    echo "  --help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                       # Run all tests"
    echo "  $0 -m smoke              # Run smoke tests only"
    echo "  $0 -m auth -h            # Run auth tests in headed mode"
    echo "  $0 -b firefox -d ipad    # Run on Firefox with iPad viewport"
    echo "  $0 -D                    # Run in debug mode"
    echo "  $0 -t -v                 # Run with traces and videos"
}

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

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check if npm packages are installed
    if [ ! -d "node_modules" ]; then
        log_warning "Node modules not found. Installing dependencies..."
        npm install
    fi
    
    # Check if Playwright browsers are installed
    if [ ! -d "node_modules/@playwright/test" ]; then
        log_error "Playwright is not installed. Run 'npm install' first."
        exit 1
    fi
    
    # Check environment variables
    if [ -z "$TEST_USER_EMAIL" ] || [ -z "$TEST_USER_PASSWORD" ]; then
        log_warning "Test user credentials not found in environment variables."
        log_warning "Set TEST_USER_EMAIL and TEST_USER_PASSWORD for full test coverage."
    fi
    
    log_success "Prerequisites check completed"
}

check_application() {
    log_info "Checking if application is running..."
    
    BASE_URL=${PLAYWRIGHT_BASE_URL:-"http://localhost:5173"}
    
    if curl -s --head "$BASE_URL" > /dev/null; then
        log_success "Application is running at $BASE_URL"
    else
        log_warning "Application is not running at $BASE_URL"
        log_info "Starting development server..."
        
        # Start dev server in background
        npm run dev &
        DEV_SERVER_PID=$!
        
        # Wait for server to start
        log_info "Waiting for server to start..."
        for i in {1..30}; do
            if curl -s --head "$BASE_URL" > /dev/null; then
                log_success "Development server started successfully"
                break
            fi
            
            if [ $i -eq 30 ]; then
                log_error "Failed to start development server"
                kill $DEV_SERVER_PID 2>/dev/null || true
                exit 1
            fi
            
            sleep 2
        done
    fi
}

build_playwright_command() {
    local cmd="npx playwright test"
    
    # Add test pattern based on mode
    case $RUN_MODE in
        "auth")
            cmd="$cmd tests/auth/"
            ;;
        "crud")
            cmd="$cmd tests/crud/"
            ;;
        "dashboard")
            cmd="$cmd tests/dashboard/"
            ;;
        "import")
            cmd="$cmd tests/import-export/"
            ;;
        "mobile")
            cmd="$cmd tests/mobile/"
            ;;
        "forms")
            cmd="$cmd tests/forms/"
            ;;
        "smoke")
            # Run a subset of critical tests
            cmd="$cmd tests/auth/auth.spec.ts tests/dashboard/dashboard.spec.ts"
            ;;
        "all")
            # Run all tests (default)
            ;;
    esac
    
    # Add browser/device project
    if [ "$BROWSER" != "all" ] && [ -n "$DEVICE" ]; then
        case $BROWSER in
            "chromium")
                if [ "$DEVICE" = "desktop" ]; then
                    cmd="$cmd --project=chromium-desktop"
                elif [ "$DEVICE" = "ipad" ]; then
                    cmd="$cmd --project=ipad"
                elif [ "$DEVICE" = "mobile" ]; then
                    cmd="$cmd --project=iphone"
                fi
                ;;
            "firefox")
                cmd="$cmd --project=firefox-desktop"
                ;;
            "webkit")
                cmd="$cmd --project=webkit-desktop"
                ;;
        esac
    elif [ "$BROWSER" != "all" ]; then
        case $BROWSER in
            "chromium")
                cmd="$cmd --project=chromium-desktop"
                ;;
            "firefox")
                cmd="$cmd --project=firefox-desktop"
                ;;
            "webkit")
                cmd="$cmd --project=webkit-desktop"
                ;;
        esac
    fi
    
    # Add execution options
    if [ "$HEADED" = true ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$DEBUG" = true ]; then
        cmd="$cmd --debug"
        WORKERS=1  # Debug mode should run with 1 worker
    fi
    
    if [ "$SCREENSHOT" = true ]; then
        cmd="$cmd --screenshot=only-on-failure"
    fi
    
    if [ "$VIDEO" = true ]; then
        cmd="$cmd --video=retain-on-failure"
    fi
    
    if [ "$TRACE" = true ]; then
        cmd="$cmd --trace=on-first-retry"
    fi
    
    if [ "$WORKERS" != "auto" ]; then
        cmd="$cmd --workers=$WORKERS"
    fi
    
    if [ "$RETRIES" != "1" ]; then
        cmd="$cmd --retries=$RETRIES"
    fi
    
    echo "$cmd"
}

run_tests() {
    local cmd=$(build_playwright_command)
    
    log_info "Running tests with command: $cmd"
    log_info "Test configuration:"
    log_info "  Mode: $RUN_MODE"
    log_info "  Browser: $BROWSER"
    log_info "  Headed: $HEADED"
    log_info "  Debug: $DEBUG"
    log_info "  Workers: $WORKERS"
    log_info "  Retries: $RETRIES"
    
    # Create results directory
    mkdir -p test-results
    
    # Run the tests
    if eval "$cmd"; then
        log_success "Tests completed successfully"
        return 0
    else
        log_error "Tests failed"
        return 1
    fi
}

generate_report() {
    if [ "$REPORT" = true ] && [ "$DEBUG" = false ]; then
        log_info "Generating HTML report..."
        
        if npx playwright show-report --host 0.0.0.0 > /dev/null 2>&1 & then
            REPORT_PID=$!
            log_success "HTML report generated. View at: http://localhost:9323"
            log_info "Report server PID: $REPORT_PID (kill with: kill $REPORT_PID)"
        else
            log_warning "Failed to start report server"
        fi
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Kill development server if we started it
    if [ -n "$DEV_SERVER_PID" ]; then
        kill $DEV_SERVER_PID 2>/dev/null || true
        log_info "Development server stopped"
    fi
    
    # Kill report server if running
    if [ -n "$REPORT_PID" ]; then
        kill $REPORT_PID 2>/dev/null || true
        log_info "Report server stopped"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            RUN_MODE="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -d|--device)
            DEVICE="$2"
            shift 2
            ;;
        -h|--headed)
            HEADED=true
            shift
            ;;
        -D|--debug)
            DEBUG=true
            HEADED=true  # Debug mode implies headed
            shift
            ;;
        --no-report)
            REPORT=false
            shift
            ;;
        -s|--screenshot)
            SCREENSHOT=true
            shift
            ;;
        -v|--video)
            VIDEO=true
            shift
            ;;
        -t|--trace)
            TRACE=true
            shift
            ;;
        -w|--workers)
            WORKERS="$2"
            shift 2
            ;;
        -r|--retries)
            RETRIES="$2"
            shift 2
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Set up cleanup trap
trap cleanup EXIT

# Main execution
main() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  KitchenPantry CRM - Test Runner"
    echo "=========================================="
    echo -e "${NC}"
    
    check_prerequisites
    check_application
    
    local start_time=$(date +%s)
    
    if run_tests; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "All tests completed in ${duration}s"
        
        generate_report
        
        echo ""
        log_info "Test artifacts:"
        log_info "  HTML Report: test-results/playwright-report/index.html"
        log_info "  JSON Results: test-results/results.json"
        log_info "  Screenshots: test-results/test-results/"
        
        if [ "$TRACE" = true ]; then
            log_info "  Traces: test-results/test-results/ (view with: npx playwright show-trace)"
        fi
        
        exit 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_error "Tests failed after ${duration}s"
        
        generate_report
        
        echo ""
        log_info "Debug information:"
        log_info "  Check test-results/ for detailed logs"
        log_info "  Run with --debug flag for interactive debugging"
        log_info "  Use --trace flag to capture execution traces"
        
        exit 1
    fi
}

# Run main function
main "$@"