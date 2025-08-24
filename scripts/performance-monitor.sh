#!/bin/bash

# CRM Performance Monitoring Script
# Comprehensive performance analysis and reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
REPORT_DIR="./performance-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${REPORT_DIR}/performance_report_${TIMESTAMP}.md"

# Create reports directory if it doesn't exist
mkdir -p "$REPORT_DIR"

echo -e "${BOLD}🚀 CRM Performance Audit${NC}"
echo -e "${BOLD}========================${NC}"
echo "Report will be saved to: $REPORT_FILE"
echo ""

# Initialize report file
cat > "$REPORT_FILE" << EOF
# CRM Performance Report - $(date)

## Executive Summary
This report contains comprehensive performance metrics for the KitchenPantry CRM system.

EOF

echo -e "${BLUE}📦 Bundle Size Analysis${NC}"
echo "Building application for production..."

# Build the application
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
    
    # Analyze bundle sizes
    if [ -d "dist" ]; then
        echo "Bundle size breakdown:"
        ls -lah dist/assets/ | grep -E '\.(js|css)$' | while read line; do
            size=$(echo "$line" | awk '{print $5}')
            file=$(echo "$line" | awk '{print $9}')
            echo "  $file: $size"
        done
        
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
        echo -e "${RED}❌ dist directory not found${NC}"
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 TypeScript Performance Check${NC}"

# Check TypeScript compilation time
start_time=$(date +%s%N)
if npm run type-check > /dev/null 2>&1; then
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 ))
    echo -e "${GREEN}✅ TypeScript compilation: ${duration}ms${NC}"
    
    # Add to report
    cat >> "$REPORT_FILE" << EOF
## TypeScript Performance
- Compilation time: ${duration}ms
- Status: ✅ Passed

EOF
else
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    cat >> "$REPORT_FILE" << EOF
## TypeScript Performance
- Status: ❌ Failed
- Check console output for errors

EOF
fi

echo ""
echo -e "${BLUE}🧪 Component Usage Analysis${NC}"

# Run component analysis if script exists
if [ -f "scripts/analyze-component-usage.js" ]; then
    echo "Running component usage analysis..."
    
    # Capture analysis output
    analysis_output=$(node scripts/analyze-component-usage.js 2>/dev/null | tail -10)
    
    cat >> "$REPORT_FILE" << EOF
## Component Architecture Health

\`\`\`
$analysis_output
\`\`\`

EOF
    echo -e "${GREEN}✅ Component analysis complete${NC}"
else
    echo -e "${YELLOW}⚠️  Component analysis script not found${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Development Server Performance${NC}"

# Test dev server startup time
echo "Testing development server startup time..."
start_time=$(date +%s%N)

# Start dev server in background and wait for it to be ready
timeout 30s npm run dev > /tmp/dev_server_log 2>&1 &
DEV_PID=$!

# Wait for server to be ready
READY=false
for i in {1..30}; do
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

if [ "$READY" = true ]; then
    echo -e "${GREEN}✅ Dev server ready in: ${duration}ms${NC}"
    cat >> "$REPORT_FILE" << EOF
## Development Server Performance
- Startup time: ${duration}ms
- Status: ✅ Ready

EOF
else
    echo -e "${RED}❌ Dev server failed to start within 30s${NC}"
    cat >> "$REPORT_FILE" << EOF
## Development Server Performance
- Status: ❌ Failed to start within 30s
- Check development configuration

EOF
fi

echo ""
echo -e "${BLUE}📱 Mobile Performance Simulation${NC}"

# Check for mobile-specific optimizations
mobile_css_count=$(find src/ -name "*.css" -exec grep -l "@media.*mobile\|@media.*max-width.*768" {} \; 2>/dev/null | wc -l)
responsive_components=$(find src/ -name "*.tsx" -exec grep -l "useIsMobile\|useMobile\|mobile" {} \; 2>/dev/null | wc -l)

echo "Mobile-specific CSS files: $mobile_css_count"
echo "Mobile-aware components: $responsive_components"

cat >> "$REPORT_FILE" << EOF
## Mobile Performance Indicators
- Mobile-specific CSS files: $mobile_css_count
- Mobile-aware components: $responsive_components
- Mobile optimization score: $(( (mobile_css_count + responsive_components) * 10 ))%

EOF

echo ""
echo -e "${BLUE}🗃️ Database Query Analysis${NC}"

# Check if we have database query analysis tools
if command -v psql > /dev/null 2>&1 && [ ! -z "$DATABASE_URL" ]; then
    echo "Running database performance analysis..."
    
    # Get query statistics (if pg_stat_statements is available)
    query_stats=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_stat_statements;" 2>/dev/null || echo "0")
    
    if [ "$query_stats" -gt 0 ]; then
        echo -e "${GREEN}✅ Database stats available: $query_stats queries tracked${NC}"
        
        # Get top 5 slowest queries
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
        echo -e "${YELLOW}⚠️  pg_stat_statements not available or empty${NC}"
        cat >> "$REPORT_FILE" << EOF
## Database Performance
- Status: ⚠️ pg_stat_statements not available
- Recommendation: Enable pg_stat_statements for query performance tracking

EOF
    fi
else
    echo -e "${YELLOW}⚠️  Database connection not available${NC}"
    cat >> "$REPORT_FILE" << EOF
## Database Performance
- Status: ⚠️ Database not accessible for performance analysis
- Check DATABASE_URL environment variable

EOF
fi

echo ""
echo -e "${BLUE}📈 Performance Recommendations${NC}"

# Generate performance recommendations based on findings
recommendations=""

# Bundle size recommendations
if [ -d "dist" ]; then
    total_js_size=$(du -c dist/assets/*.js 2>/dev/null | tail -1 | cut -f1)
    if [ "$total_js_size" -gt 500 ]; then
        recommendations+="- 🚨 Bundle size is large (${total_js_size}KB). Consider code splitting and lazy loading.\n"
    fi
fi

# TypeScript recommendations
if [ "$duration" -gt 5000 ]; then
    recommendations+="- ⚠️  TypeScript compilation is slow (${duration}ms). Consider incremental compilation.\n"
fi

# Mobile recommendations
if [ "$mobile_css_count" -lt 3 ]; then
    recommendations+="- 📱 Limited mobile-specific CSS. Consider mobile-first optimizations.\n"
fi

# Add recommendations to report
cat >> "$REPORT_FILE" << EOF
## Performance Recommendations

$(echo -e "$recommendations")

### Suggested Next Steps
1. Run \`npm run analyze\` for detailed bundle analysis
2. Implement lazy loading for large components
3. Add performance monitoring to CI/CD pipeline
4. Consider implementing service worker for caching
5. Optimize images and implement WebP format

### Tools for Further Analysis
- Lighthouse: \`npx lighthouse http://localhost:5173\`
- Bundle Analyzer: \`npm run analyze\`
- React DevTools Profiler for component analysis

EOF

# Display summary
echo -e "${GREEN}✅ Performance audit complete!${NC}"
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

# Return success
exit 0