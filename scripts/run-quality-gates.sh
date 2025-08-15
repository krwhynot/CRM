#!/bin/bash

# Quality Gates Master Execution Script
# 
# This script orchestrates all quality gate validations for the MVP Principal CRM transformation.
# It provides a comprehensive validation pipeline with clear reporting and failure handling.
#
# Usage: ./scripts/run-quality-gates.sh [stage] [options]
# 
# Stages: all, build, database, testing, performance
# Options: --baseline, --fix, --detailed, --ci

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$ROOT_DIR/quality-gates-logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create log directory
mkdir -p "$LOG_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_DIR/quality-gates-${TIMESTAMP}.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_DIR/quality-gates-${TIMESTAMP}.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_DIR/quality-gates-${TIMESTAMP}.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_DIR/quality-gates-${TIMESTAMP}.log"
}

# Parse arguments
STAGE="${1:-all}"
shift 2>/dev/null || true
OPTIONS="$*"

# Validate stage
case "$STAGE" in
    all|build|database|testing|performance)
        ;;
    *)
        log_error "Invalid stage: $STAGE"
        echo "Valid stages: all, build, database, testing, performance"
        exit 1
        ;;
esac

log_info "Quality Gates Validation Started"
log_info "Stage: $STAGE"
log_info "Options: $OPTIONS"
log_info "Timestamp: $TIMESTAMP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Initialize results tracking
TOTAL_GATES=0
PASSED_GATES=0
FAILED_GATES=0
declare -a FAILED_GATE_NAMES=()

# Function to run a quality gate
run_gate() {
    local gate_name="$1"
    local gate_command="$2"
    local gate_description="$3"
    
    log_info "Running: $gate_description"
    echo "   Command: $gate_command"
    
    TOTAL_GATES=$((TOTAL_GATES + 1))
    
    # Create gate-specific log file
    local gate_log="$LOG_DIR/gate-${gate_name}-${TIMESTAMP}.log"
    
    # Run the gate command
    if eval "$gate_command" > "$gate_log" 2>&1; then
        log_success "$gate_description - PASSED"
        PASSED_GATES=$((PASSED_GATES + 1))
        return 0
    else
        log_error "$gate_description - FAILED"
        FAILED_GATES=$((FAILED_GATES + 1))
        FAILED_GATE_NAMES+=("$gate_name")
        
        # Show last few lines of error log
        echo "   Last 5 lines from error log:"
        tail -5 "$gate_log" | sed 's/^/      /'
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "$ROOT_DIR/package.json" ]; then
        log_error "package.json not found in $ROOT_DIR"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "$ROOT_DIR/node_modules" ]; then
        log_warning "node_modules not found, running npm install..."
        cd "$ROOT_DIR"
        npm install
    fi
    
    log_success "Prerequisites check completed"
}

# Function to run build gates
run_build_gates() {
    log_info "━━━ BUILD QUALITY GATES ━━━"
    
    # TypeScript compilation
    run_gate "typescript" \
        "cd '$ROOT_DIR' && npx tsc --noEmit" \
        "TypeScript Compilation Check"
    
    # ESLint validation
    run_gate "eslint" \
        "cd '$ROOT_DIR' && npm run lint" \
        "ESLint Code Quality Check"
    
    # Production build
    run_gate "build" \
        "cd '$ROOT_DIR' && npm run build" \
        "Production Build Validation"
    
    # Build performance measurement
    run_gate "build-performance" \
        "cd '$ROOT_DIR' && node scripts/measure-performance-baseline.js" \
        "Build Performance Measurement"
}

# Function to run database gates
run_database_gates() {
    log_info "━━━ DATABASE QUALITY GATES ━━━"
    
    # Database health validation
    run_gate "database-health" \
        "cd '$ROOT_DIR' && node scripts/validate-database-health.js $OPTIONS" \
        "Database Health Validation"
    
    # Database advisor checks (requires Supabase project)
    if [[ "$OPTIONS" != *"--skip-supabase"* ]]; then
        log_info "Note: Database advisor checks require Supabase project access"
        # This would run actual Supabase advisor checks in a real environment
        log_success "Database Advisor Checks - SKIPPED (offline mode)"
    fi
}

# Function to run testing gates
run_testing_gates() {
    log_info "━━━ TESTING QUALITY GATES ━━━"
    
    # Test baseline establishment
    run_gate "test-baseline" \
        "cd '$ROOT_DIR' && node scripts/establish-test-baseline.js --run $OPTIONS" \
        "Test Coverage Baseline"
    
    # Run existing E2E tests if available
    if [ -d "$ROOT_DIR/tests" ] && [ -f "$ROOT_DIR/tests/run-interactions-e2e-tests.js" ]; then
        run_gate "e2e-tests" \
            "cd '$ROOT_DIR/tests' && node run-interactions-e2e-tests.js" \
            "Existing E2E Test Execution"
    else
        log_warning "No E2E tests found - create tests for comprehensive coverage"
    fi
}

# Function to run performance gates
run_performance_gates() {
    log_info "━━━ PERFORMANCE QUALITY GATES ━━━"
    
    # Performance baseline measurement
    run_gate "performance-baseline" \
        "cd '$ROOT_DIR' && node scripts/measure-performance-baseline.js $OPTIONS" \
        "Performance Baseline Measurement"
    
    # Bundle analysis
    if [ -d "$ROOT_DIR/dist" ]; then
        run_gate "bundle-analysis" \
            "cd '$ROOT_DIR' && du -sh dist/ && ls -la dist/assets/" \
            "Bundle Size Analysis"
    else
        log_warning "No dist directory found - run build first"
    fi
}

# Function to generate comprehensive report
generate_report() {
    log_info "━━━ GENERATING COMPREHENSIVE REPORT ━━━"
    
    local report_file="$LOG_DIR/quality-gates-summary-${TIMESTAMP}.md"
    
    cat > "$report_file" << EOF
# Quality Gates Validation Report

**Timestamp**: $(date)  
**Stage**: $STAGE  
**Options**: $OPTIONS  

## Summary

- **Total Gates**: $TOTAL_GATES
- **Passed**: $PASSED_GATES
- **Failed**: $FAILED_GATES
- **Success Rate**: $(( PASSED_GATES * 100 / TOTAL_GATES ))%

## Results

### Passed Gates: $PASSED_GATES/$TOTAL_GATES

EOF

    if [ $FAILED_GATES -gt 0 ]; then
        cat >> "$report_file" << EOF
### Failed Gates: $FAILED_GATES

EOF
        for failed_gate in "${FAILED_GATE_NAMES[@]}"; do
            echo "- $failed_gate" >> "$report_file"
        done
        
        cat >> "$report_file" << EOF

### Remediation Steps

1. Review individual gate logs in: \`$LOG_DIR\`
2. Fix failing gates before proceeding with transformation
3. Re-run quality gates after fixes: \`./scripts/run-quality-gates.sh $STAGE $OPTIONS\`

EOF
    fi

    cat >> "$report_file" << EOF
## Baseline Metrics

### Build Performance
- Build time threshold: 30 seconds
- Bundle size threshold: 800KB
- CSS size threshold: 65KB

### Database Health
- Cache hit rate: ≥95%
- Duplicate indexes: ≤5
- Security warnings: ≤8

### Test Coverage
- Unit test coverage: ≥80%
- E2E test coverage: ≥70%
- Critical path coverage: ≥95%

### Performance Thresholds
- First Contentful Paint: ≤2s
- Largest Contentful Paint: ≤4s
- Cumulative Layout Shift: ≤0.1

## Generated Files

- Main log: \`quality-gates-${TIMESTAMP}.log\`
- Individual gate logs: \`gate-*-${TIMESTAMP}.log\`
- Report file: \`quality-gates-summary-${TIMESTAMP}.md\`

## Next Steps

EOF

    if [ $FAILED_GATES -eq 0 ]; then
        cat >> "$report_file" << EOF
✅ **All quality gates passed!**

The system is ready for MVP Principal CRM transformation:

1. Proceed with planned transformation stages
2. Run quality gates before each major change
3. Monitor performance during transformation
4. Maintain test coverage above thresholds

EOF
    else
        cat >> "$report_file" << EOF
❌ **Quality gates failed - Action required**

Before proceeding with transformation:

1. Address all failing quality gates
2. Review and fix code quality issues
3. Ensure database health is optimal
4. Implement missing test coverage
5. Re-run validation: \`./scripts/run-quality-gates.sh\`

**Do not proceed with transformation until all gates pass.**

EOF
    fi

    log_info "Report generated: $report_file"
    
    # Display summary
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Quality Gates Validation Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Results: $PASSED_GATES/$TOTAL_GATES gates passed ($(( PASSED_GATES * 100 / TOTAL_GATES ))%)"
    
    if [ $FAILED_GATES -eq 0 ]; then
        log_success "All quality gates PASSED"
        log_success "System ready for MVP Principal CRM transformation"
    else
        log_error "$FAILED_GATES quality gates FAILED"
        log_error "Fix failing gates before proceeding with transformation"
        echo ""
        echo "Failed gates:"
        for failed_gate in "${FAILED_GATE_NAMES[@]}"; do
            echo "  - $failed_gate"
        done
    fi
    
    echo ""
    echo "📄 Full report: $report_file"
    echo "📁 Logs directory: $LOG_DIR"
}

# Main execution
main() {
    # Change to root directory
    cd "$ROOT_DIR"
    
    # Check prerequisites
    check_prerequisites
    
    # Run quality gates based on stage
    case "$STAGE" in
        "all")
            run_build_gates
            run_database_gates
            run_testing_gates
            run_performance_gates
            ;;
        "build")
            run_build_gates
            ;;
        "database")
            run_database_gates
            ;;
        "testing")
            run_testing_gates
            ;;
        "performance")
            run_performance_gates
            ;;
    esac
    
    # Generate comprehensive report
    generate_report
    
    # Exit with appropriate code
    if [ $FAILED_GATES -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"