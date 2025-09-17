#!/bin/bash

# CRM Performance Monitoring Script
# Comprehensive performance analysis and reporting with parameterized execution levels
#
# Usage: ./scripts/performance-monitor.sh [level] [options]
# Levels: basic, full, build, runtime, network, analysis
# Options: --quiet, --no-timeout, --output-dir=DIR

set -e

# Default configuration
DEFAULT_LEVEL="basic"
DEFAULT_TIMEOUT=60
QUIET_MODE=false
OUTPUT_DIR="./performance-reports"
CUSTOM_TIMEOUT=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to show help
show_help() {
  cat << EOF
CRM Performance Monitoring Script

Usage: $0 [level] [options]

Monitoring Levels:
  basic       - Bundle size and TypeScript compilation (default, fast for CI)
  build       - Build-related metrics (bundle, TypeScript, components)
  runtime     - Runtime performance (dev server, mobile optimization)
  network     - Network and database performance
  analysis    - Detailed analysis (bundle, components, mobile, database)
  full        - All performance metrics (comprehensive)
  comprehensive - Alias for 'full'

Options:
  --quiet             - Suppress output (CI-friendly)
  --no-timeout        - Disable timeout limits
  --timeout=SECONDS   - Set custom timeout (default: 60)
  --output-dir=DIR    - Set output directory (default: ./performance-reports)
  --help              - Show this help message

Examples:
  $0                              # Basic monitoring (default)
  $0 basic --quiet               # CI-friendly basic check
  $0 full                        # Comprehensive analysis
  $0 build --timeout=30          # Build analysis with 30s timeout
  $0 network --quiet --no-timeout # Network analysis, quiet, no timeout

For CI/CD integration, use:
  $0 basic --quiet --timeout=30

EOF
}

# Parse command line arguments
MONITORING_LEVEL=""
if [[ $# -gt 0 ]] && [[ ! "$1" =~ ^-- ]]; then
  # First argument is monitoring level if it doesn't start with --
  if [[ "$1" =~ ^(basic|build|runtime|network|analysis|full|comprehensive)$ ]]; then
    MONITORING_LEVEL="$1"
    shift
  elif [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
    exit 0
  else
    echo "Unknown monitoring level: $1"
    echo "Run '$0 --help' for usage information"
    exit 1
  fi
fi

# Set default level if not specified
MONITORING_LEVEL="${MONITORING_LEVEL:-$DEFAULT_LEVEL}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --help|-h)
      show_help
      exit 0
      ;;
    --quiet)
      QUIET_MODE=true
      shift
      ;;
    --no-timeout)
      CUSTOM_TIMEOUT="disabled"
      shift
      ;;
    --timeout=*)
      CUSTOM_TIMEOUT="${1#*=}"
      shift
      ;;
    --output-dir=*)
      OUTPUT_DIR="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run '$0 --help' for usage information"
      exit 1
      ;;
  esac
done

# Configuration
REPORT_DIR="$OUTPUT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${REPORT_DIR}/performance_report_${TIMESTAMP}.md"
TIMEOUT_SECONDS="${CUSTOM_TIMEOUT:-$DEFAULT_TIMEOUT}"

# Create reports directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Function to log with quiet mode support
log() {
  if [ "$QUIET_MODE" != "true" ]; then
    echo -e "$@"
  fi
}

# Function to run with timeout if enabled
run_with_timeout() {
  local cmd="$1"
  local description="$2"

  if [ "$TIMEOUT_SECONDS" != "disabled" ] && [ -n "$TIMEOUT_SECONDS" ]; then
    if ! timeout "${TIMEOUT_SECONDS}s" bash -c "$cmd"; then
      log "${YELLOW}⚠️ $description timed out after ${TIMEOUT_SECONDS}s${NC}"
      return 1
    fi
  else
    bash -c "$cmd"
  fi
}

# Function to check if level should run specific component
should_run_component() {
  local component="$1"

  case "$MONITORING_LEVEL" in
    "basic")
      [[ "$component" =~ ^(bundle|typescript)$ ]]
      ;;
    "build")
      [[ "$component" =~ ^(bundle|typescript|component)$ ]]
      ;;
    "runtime")
      [[ "$component" =~ ^(devserver|mobile)$ ]]
      ;;
    "network")
      [[ "$component" =~ ^(database|devserver)$ ]]
      ;;
    "analysis")
      [[ "$component" =~ ^(bundle|component|mobile|database)$ ]]
      ;;
    "full"|"comprehensive")
      true  # Run all components
      ;;
    *)
      log "${RED}Unknown monitoring level: $MONITORING_LEVEL${NC}"
      log "Available levels: basic, build, runtime, network, analysis, full, comprehensive"
      exit 1
      ;;
  esac
}

# Display header and configuration
log "${BOLD}🚀 CRM Performance Audit - Level: ${MONITORING_LEVEL}${NC}"
log "${BOLD}========================================${NC}"
log "📋 Monitoring Level: $MONITORING_LEVEL"
log "⏱️ Timeout: ${TIMEOUT_SECONDS}s"
log "📁 Output Directory: $REPORT_DIR"
log "🔇 Quiet Mode: $QUIET_MODE"
if [ "$QUIET_MODE" != "true" ]; then
  echo "📄 Report File: $REPORT_FILE"
  echo ""
fi

# Initialize report file with level-specific information
cat > "$REPORT_FILE" << EOF
# CRM Performance Report - $(date)

## Configuration
- **Monitoring Level**: $MONITORING_LEVEL
- **Timeout**: ${TIMEOUT_SECONDS}s
- **Generated**: $(date)

## Executive Summary
This report contains performance metrics for the KitchenPantry CRM system at monitoring level: **$MONITORING_LEVEL**.

### Available Monitoring Levels:
- **basic**: Bundle size and TypeScript compilation
- **build**: Build-related metrics (bundle, TypeScript, components)
- **runtime**: Runtime performance (dev server, mobile optimization)
- **network**: Network and database performance
- **analysis**: Detailed analysis (bundle, components, mobile, database)
- **full/comprehensive**: All performance metrics

EOF

# Bundle Size Analysis
if should_run_component "bundle"; then
    log "${BLUE}📦 Bundle Size Analysis${NC}"
    log "Building application for production..."

    # Build the application with timeout
    if run_with_timeout "npm run build > /dev/null 2>&1" "Build process"; then
        log "${GREEN}✅ Build successful${NC}"

        # Analyze bundle sizes
        if [ -d "dist" ]; then
            if [ "$QUIET_MODE" != "true" ]; then
                echo "Bundle size breakdown:"
                ls -lah dist/assets/ | grep -E '\.(js|css)$' | while read line; do
                    size=$(echo "$line" | awk '{print $5}')
                    file=$(echo "$line" | awk '{print $9}')
                    echo "  $file: $size"
                done
            fi

            # Add to report
            cat >> "$REPORT_FILE" << EOF

## Bundle Analysis

\`\`\`
$(ls -lah dist/assets/ | grep -E '\.(js|css)$')
\`\`\`

### Bundle Size Summary
$(du -sh dist/ | cut -f1) - Total bundle size
$(du -sh dist/assets/*.js 2>/dev/null | wc -l) JavaScript files
$(du -sh dist/assets/*.css 2>/dev/null | wc -l) CSS files

EOF

        else
            log "${RED}❌ dist directory not found${NC}"
        fi
    else
        log "${RED}❌ Build failed or timed out${NC}"
        # In CI mode, don't exit on build failure to allow other checks
        if [ "$MONITORING_LEVEL" = "basic" ] && [ "$TIMEOUT_SECONDS" != "disabled" ]; then
            exit 1
        fi
    fi

    if [ "$QUIET_MODE" != "true" ]; then
        echo ""
    fi
fi

# TypeScript Performance Check
if should_run_component "typescript"; then
    log "${BLUE}📊 TypeScript Performance Check${NC}"

    # Check TypeScript compilation time
    start_time=$(date +%s%N)
    if run_with_timeout "npm run type-check > /dev/null 2>&1" "TypeScript compilation"; then
        end_time=$(date +%s%N)
        duration=$(( (end_time - start_time) / 1000000 ))
        log "${GREEN}✅ TypeScript compilation: ${duration}ms${NC}"

        # Add to report
        cat >> "$REPORT_FILE" << EOF
## TypeScript Performance
- Compilation time: ${duration}ms
- Status: ✅ Passed

EOF
    else
        log "${RED}❌ TypeScript compilation failed or timed out${NC}"
        cat >> "$REPORT_FILE" << EOF
## TypeScript Performance
- Status: ❌ Failed or timed out
- Check console output for errors

EOF
    fi

    if [ "$QUIET_MODE" != "true" ]; then
        echo ""
    fi
fi

# Component Usage Analysis
if should_run_component "component"; then
    log "${BLUE}🧪 Component Usage Analysis${NC}"

    # Run component analysis if script exists
    if [ -f "scripts/analyze-component-usage.js" ]; then
        log "Running component usage analysis..."

        # Capture analysis output with timeout
        if run_with_timeout "node scripts/analyze-component-usage.js 2>/dev/null" "Component analysis"; then
            analysis_output=$(node scripts/analyze-component-usage.js 2>/dev/null | tail -10)

            cat >> "$REPORT_FILE" << EOF
## Component Architecture Health

\`\`\`
$analysis_output
\`\`\`

EOF
            log "${GREEN}✅ Component analysis complete${NC}"
        else
            log "${YELLOW}⚠️ Component analysis timed out${NC}"
            cat >> "$REPORT_FILE" << EOF
## Component Architecture Health
- Status: ⚠️ Analysis timed out after ${TIMEOUT_SECONDS}s

EOF
        fi
    else
        log "${YELLOW}⚠️  Component analysis script not found${NC}"
        cat >> "$REPORT_FILE" << EOF
## Component Architecture Health
- Status: ⚠️ Analysis script not found

EOF
    fi

    if [ "$QUIET_MODE" != "true" ]; then
        echo ""
    fi
fi

# Development Server Performance
if should_run_component "devserver"; then
    log "${BLUE}🔍 Development Server Performance${NC}"

    # Test dev server startup time
    log "Testing development server startup time..."
    start_time=$(date +%s%N)

    # Start dev server in background with timeout
    local_timeout="${TIMEOUT_SECONDS}"
    if [ "$local_timeout" = "disabled" ]; then
        local_timeout=30  # Default 30s for dev server test
    fi

    timeout "${local_timeout}s" npm run dev > /tmp/dev_server_log 2>&1 &
    DEV_PID=$!

    # Wait for server to be ready
    READY=false
    max_wait=$(( local_timeout < 30 ? local_timeout : 30 ))
    for i in $(seq 1 $max_wait); do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            end_time=$(date +%s%N)
            duration=$(( (end_time - start_time) / 1000000 ))
            READY=true
            break
        fi
        sleep 1
    done

    # Kill the dev server
    kill $DEV_PID 2>/dev/null || true
    # Clean up any remaining processes
    pkill -f "vite" > /dev/null 2>&1 || true

    if [ "$READY" = true ]; then
        log "${GREEN}✅ Dev server ready in: ${duration}ms${NC}"
        cat >> "$REPORT_FILE" << EOF
## Development Server Performance
- Startup time: ${duration}ms
- Status: ✅ Ready

EOF
    else
        log "${RED}❌ Dev server failed to start within ${max_wait}s${NC}"
        cat >> "$REPORT_FILE" << EOF
## Development Server Performance
- Status: ❌ Failed to start within ${max_wait}s
- Check development configuration

EOF
    fi

    if [ "$QUIET_MODE" != "true" ]; then
        echo ""
    fi
fi

# Mobile Performance Simulation
if should_run_component "mobile"; then
    log "${BLUE}📱 Mobile Performance Simulation${NC}"

    # Check for mobile-specific optimizations
    mobile_css_count=$(find src/ -name "*.css" -exec grep -l "@media.*mobile\|@media.*max-width.*768" {} \; 2>/dev/null | wc -l)
    responsive_components=$(find src/ -name "*.tsx" -exec grep -l "useIsMobile\|useMobile\|mobile" {} \; 2>/dev/null | wc -l)

    log "Mobile-specific CSS files: $mobile_css_count"
    log "Mobile-aware components: $responsive_components"

    cat >> "$REPORT_FILE" << EOF
## Mobile Performance Indicators
- Mobile-specific CSS files: $mobile_css_count
- Mobile-aware components: $responsive_components
- Mobile optimization score: $(( (mobile_css_count + responsive_components) * 10 ))%

EOF

    if [ "$QUIET_MODE" != "true" ]; then
        echo ""
    fi
fi

# Database Query Analysis
if should_run_component "database"; then
    log "${BLUE}🗃️ Database Query Analysis${NC}"

    # Check if we have database query analysis tools
    if command -v psql > /dev/null 2>&1 && [ ! -z "$DATABASE_URL" ]; then
        log "Running database performance analysis..."

        # Get query statistics with timeout (if pg_stat_statements is available)
        if run_with_timeout "psql \"$DATABASE_URL\" -t -c \"SELECT COUNT(*) FROM pg_stat_statements;\" 2>/dev/null" "Database query stats"; then
            query_stats=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_stat_statements;" 2>/dev/null || echo "0")

            if [ "$query_stats" -gt 0 ]; then
                log "${GREEN}✅ Database stats available: $query_stats queries tracked${NC}"

                # Get top 5 slowest queries with timeout
                if run_with_timeout "psql \"$DATABASE_URL\" -t -c \"SELECT query, calls, mean_time::numeric(10,2), total_time::numeric(10,2) FROM pg_stat_statements WHERE query NOT LIKE '%pg_stat_statements%' ORDER BY mean_time DESC LIMIT 5;\" 2>/dev/null" "Slow query analysis"; then
                    slow_queries=$(psql "$DATABASE_URL" -t -c "
                        SELECT query, calls, mean_time::numeric(10,2), total_time::numeric(10,2)
                        FROM pg_stat_statements
                        WHERE query NOT LIKE '%pg_stat_statements%'
                        ORDER BY mean_time DESC
                        LIMIT 5;" 2>/dev/null)

                    cat >> "$REPORT_FILE" << EOF
## Database Performance
- Queries tracked: $query_stats
- pg_stat_statements: ✅ Available

### Top 5 Slowest Queries
\`\`\`
$slow_queries
\`\`\`

EOF
                else
                    log "${YELLOW}⚠️ Slow query analysis timed out${NC}"
                    cat >> "$REPORT_FILE" << EOF
## Database Performance
- Queries tracked: $query_stats
- pg_stat_statements: ✅ Available
- Status: ⚠️ Slow query analysis timed out after ${TIMEOUT_SECONDS}s

EOF
                fi
            else
                log "${YELLOW}⚠️  pg_stat_statements not available or empty${NC}"
                cat >> "$REPORT_FILE" << EOF
## Database Performance
- Status: ⚠️ pg_stat_statements not available
- Recommendation: Enable pg_stat_statements for query performance tracking

EOF
            fi
        else
            log "${YELLOW}⚠️ Database query analysis timed out${NC}"
            cat >> "$REPORT_FILE" << EOF
## Database Performance
- Status: ⚠️ Database analysis timed out after ${TIMEOUT_SECONDS}s
- Check DATABASE_URL and connection performance

EOF
        fi
    else
        log "${YELLOW}⚠️  Database connection not available${NC}"
        cat >> "$REPORT_FILE" << EOF
## Database Performance
- Status: ⚠️ Database not accessible for performance analysis
- Check DATABASE_URL environment variable

EOF
    fi

    if [ "$QUIET_MODE" != "true" ]; then
        echo ""
    fi
fi

# Performance Recommendations and Summary
log "${BLUE}📈 Performance Recommendations${NC}"

# Generate performance recommendations based on findings
recommendations=""

# Bundle size recommendations (only if bundle analysis ran)
if should_run_component "bundle" && [ -d "dist" ]; then
    total_js_size=$(du -c dist/assets/*.js 2>/dev/null | tail -1 | cut -f1)
    if [ "$total_js_size" -gt 500 ]; then
        recommendations+="- 🚨 Bundle size is large (${total_js_size}KB). Consider code splitting and lazy loading.\n"
    fi
fi

# TypeScript recommendations (only if typescript analysis ran)
if should_run_component "typescript" && [ ! -z "$duration" ] && [ "$duration" -gt 5000 ]; then
    recommendations+="- ⚠️  TypeScript compilation is slow (${duration}ms). Consider incremental compilation.\n"
fi

# Mobile recommendations (only if mobile analysis ran)
if should_run_component "mobile" && [ ! -z "$mobile_css_count" ] && [ "$mobile_css_count" -lt 3 ]; then
    recommendations+="- 📱 Limited mobile-specific CSS. Consider mobile-first optimizations.\n"
fi

# Add recommendations to report
cat >> "$REPORT_FILE" << EOF
## Performance Recommendations

$(echo -e "$recommendations")

### Suggested Next Steps for Level: $MONITORING_LEVEL
1. Run \`npm run analyze\` for detailed bundle analysis
2. Implement lazy loading for large components
3. Add performance monitoring to CI/CD pipeline
4. Consider implementing service worker for caching
5. Optimize images and implement WebP format

### Tools for Further Analysis
- Lighthouse: \`npx lighthouse http://localhost:5173\`
- Bundle Analyzer: \`npm run analyze\`
- React DevTools Profiler for component analysis

### Performance Monitoring Levels
- Run \`./scripts/performance-monitor.sh basic\` for quick CI checks
- Run \`./scripts/performance-monitor.sh full\` for comprehensive analysis
- Run \`./scripts/performance-monitor.sh --quiet\` for CI-friendly output

## Summary
- **Monitoring Level**: $MONITORING_LEVEL
- **Timeout**: ${TIMEOUT_SECONDS}s
- **Report Generated**: $(date)

EOF

# Display summary
log "${GREEN}✅ Performance audit complete! (Level: $MONITORING_LEVEL)${NC}"

if [ "$QUIET_MODE" != "true" ]; then
    echo ""
    echo -e "${BOLD}Summary:${NC}"
    if [ ! -z "$recommendations" ]; then
        echo -e "${YELLOW}Issues found:${NC}"
        echo -e "$recommendations"
    else
        echo -e "${GREEN}No major performance issues detected${NC}"
    fi

    echo ""
    echo -e "${BOLD}📋 Full report saved to: ${BLUE}$REPORT_FILE${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review the full report: cat $REPORT_FILE"
    echo "2. Run Lighthouse audit: npx lighthouse http://localhost:5173"
    echo "3. Analyze bundle: npm run analyze"
    echo "4. Monitor performance: git add $REPORT_FILE && git commit -m 'docs: add performance report'"

    echo ""
    echo -e "${BLUE}Performance monitoring levels:${NC}"
    echo "  basic    - Bundle + TypeScript (fast CI check)"
    echo "  build    - Bundle + TypeScript + Components"
    echo "  runtime  - Dev server + Mobile optimization"
    echo "  network  - Database + Dev server performance"
    echo "  analysis - Detailed bundle/component/mobile/database analysis"
    echo "  full     - All performance metrics (comprehensive)"
else
    # For CI/CD: Just output the report file path for parsing
    echo "$REPORT_FILE"
fi

# Return success
exit 0