#!/bin/bash

# Enhanced Build Script with Analysis Parameters
# Part of Build Pipeline Rationalization - Task 4.2
# Supports analysis modes while maintaining core build functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Default parameters
MODE="build"
ANALYZE="false"
OPEN_ANALYZER="false"
SKIP_SIZE_CHECK="false"
BUNDLE_THRESHOLD="3.0"
VERBOSE="false"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --analyze)
      ANALYZE="true"
      shift
      ;;
    --open)
      OPEN_ANALYZER="true"
      shift
      ;;
    --skip-size-check)
      SKIP_SIZE_CHECK="true"
      shift
      ;;
    --threshold)
      BUNDLE_THRESHOLD="$2"
      shift
      shift
      ;;
    --verbose)
      VERBOSE="true"
      shift
      ;;
    --mode)
      MODE="$2"
      shift
      shift
      ;;
    --help|-h)
      echo "Enhanced Build Script - CRM Bundle Analysis and Build Optimization"
      echo ""
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --analyze               Enable bundle analysis and visualization"
      echo "  --open                  Open bundle visualizer in browser (requires --analyze)"
      echo "  --skip-size-check       Skip bundle size validation against threshold"
      echo "  --threshold SIZE        Set bundle size threshold in MB (default: 3.0)"
      echo "  --verbose               Enable verbose logging"
      echo "  --mode MODE             Build mode: build, analyze, validate (default: build)"
      echo "  --help, -h              Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                      # Standard build"
      echo "  $0 --analyze            # Build with analysis"
      echo "  $0 --analyze --open     # Build with analysis and open visualizer"
      echo "  $0 --mode validate      # Build with comprehensive validation"
      echo ""
      exit 0
      ;;
    *)
      echo "Unknown parameter: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Initialize build report
BUILD_START=$(date +%s)
REPORT_FILE="./build-report-$(date +%Y%m%d_%H%M%S).md"
echo "# Build Report - $(date)" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Mode: $MODE" >> "$REPORT_FILE"
echo "Analysis: $ANALYZE" >> "$REPORT_FILE"
echo "Bundle Threshold: ${BUNDLE_THRESHOLD}MB" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo -e "${BOLD}🚀 Enhanced Build Script${NC}"
echo -e "${BOLD}======================${NC}"
echo "Mode: $MODE"
echo "Analysis: $ANALYZE"
echo "Threshold: ${BUNDLE_THRESHOLD}MB"
echo "Report: $REPORT_FILE"
echo ""

# Clean previous build artifacts if verbose mode
if [[ "$VERBOSE" == "true" ]]; then
    echo -e "${BLUE}🧹 Cleaning previous build artifacts${NC}"
    rm -rf dist/
    echo "## Cleanup" >> "$REPORT_FILE"
    echo "Previous build artifacts removed" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Execute build based on mode
case $MODE in
  "build")
    echo -e "${BLUE}📦 Building production bundle${NC}"
    if [[ "$ANALYZE" == "true" ]]; then
      echo "Building with bundle analysis..."
      # Force visualizer to generate stats
      VITE_BUNDLE_ANALYZER=true npm run build
    else
      npm run build
    fi
    ;;

  "analyze")
    echo -e "${BLUE}📊 Building with comprehensive analysis${NC}"
    VITE_BUNDLE_ANALYZER=true npm run build
    ANALYZE="true"
    ;;

  "validate")
    echo -e "${BLUE}✅ Building with validation${NC}"
    # Run type check first
    echo "Running TypeScript validation..."
    npm run type-check

    # Run design token validation before build
    echo "Running design token validation..."
    if [ -f "./scripts/validate-design-tokens.sh" ]; then
        ./scripts/validate-design-tokens.sh --quiet || echo "⚠️ Design token validation warnings found"
    else
        echo "Design token validation script not found, skipping..."
    fi

    # Then build with analysis
    VITE_BUNDLE_ANALYZER=true npm run build
    ANALYZE="true"
    ;;

  *)
    echo -e "${RED}❌ Unknown mode: $MODE${NC}"
    echo "Supported modes: build, analyze, validate"
    exit 1
    ;;
esac

BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo "## Build Execution" >> "$REPORT_FILE"
echo "Build Time: ${BUILD_TIME}s" >> "$REPORT_FILE"
echo "Status: COMPLETED" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Validate build output
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    echo "## Build Status" >> "$REPORT_FILE"
    echo "Status: ❌ FAILED - dist directory missing" >> "$REPORT_FILE"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully in ${BUILD_TIME}s${NC}"

# Bundle size analysis
echo ""
echo -e "${BLUE}📊 Analyzing bundle size${NC}"

BUNDLE_SIZE_MB=$(du -sh dist/ | cut -f1 | sed 's/M$//')
BUNDLE_SIZE_NUM=$(echo "$BUNDLE_SIZE_MB" | sed 's/[^0-9.]*//g' | head -c 10)

echo "Bundle size: ${BUNDLE_SIZE_MB}MB"

# Log bundle analysis to report
echo "## Bundle Analysis" >> "$REPORT_FILE"
echo "Total Bundle Size: ${BUNDLE_SIZE_MB}MB" >> "$REPORT_FILE"
echo "Size Threshold: ${BUNDLE_THRESHOLD}MB" >> "$REPORT_FILE"

# Detailed bundle breakdown if dist exists
if [ -d "dist/assets" ]; then
    echo "### Asset Breakdown" >> "$REPORT_FILE"
    find dist/assets -name "*.js" -o -name "*.css" | while read file; do
        size=$(du -h "$file" | cut -f1)
        basename=$(basename "$file")
        echo "- $basename: $size" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
fi

# Design Token Bundle Analysis
echo ""
echo -e "${BLUE}🎨 Design Token Bundle Analysis${NC}"

DESIGN_TOKEN_SIZE=0
CSS_VARIABLE_COUNT=0

if [ -d "dist/assets" ]; then
    echo "### Design Token Analysis" >> "$REPORT_FILE"

    # Analyze CSS files for design token usage
    for css_file in dist/assets/*.css; do
        if [ -f "$css_file" ]; then
            # Count CSS variables in the file
            VAR_COUNT=$(grep -o -- '--[a-zA-Z-]*:' "$css_file" 2>/dev/null | wc -l || echo 0)
            CSS_VARIABLE_COUNT=$((CSS_VARIABLE_COUNT + VAR_COUNT))

            # Check for design token chunk
            if [[ "$css_file" =~ design-tokens ]]; then
                DESIGN_TOKEN_SIZE=$(du -h "$css_file" | cut -f1)
                echo "Design token chunk found: $css_file ($DESIGN_TOKEN_SIZE)"
                echo "- Design token chunk: $(basename "$css_file") - $DESIGN_TOKEN_SIZE" >> "$REPORT_FILE"
            fi
        fi
    done

    # Analyze JS files for design token imports
    DESIGN_TOKEN_JS_COUNT=0
    for js_file in dist/assets/*.js; do
        if [ -f "$js_file" ]; then
            if [[ "$js_file" =~ design-tokens ]]; then
                JS_SIZE=$(du -h "$js_file" | cut -f1)
                echo "Design token JS chunk: $js_file ($JS_SIZE)"
                echo "- Design token JS chunk: $(basename "$js_file") - $JS_SIZE" >> "$REPORT_FILE"
                DESIGN_TOKEN_JS_COUNT=$((DESIGN_TOKEN_JS_COUNT + 1))
            fi
        fi
    done

    echo "Total CSS variables found: $CSS_VARIABLE_COUNT"
    echo "Design token chunks: $DESIGN_TOKEN_JS_COUNT"

    echo "- Total CSS variables: $CSS_VARIABLE_COUNT" >> "$REPORT_FILE"
    echo "- Design token JS chunks: $DESIGN_TOKEN_JS_COUNT" >> "$REPORT_FILE"

    # Bundle size impact analysis
    if [ "$CSS_VARIABLE_COUNT" -gt 0 ]; then
        VARS_PER_KB=$(echo "scale=2; $CSS_VARIABLE_COUNT / $(echo $BUNDLE_SIZE_NUM | bc -l)" | bc -l 2>/dev/null || echo "0")
        echo "CSS variable density: ${VARS_PER_KB} vars/MB"
        echo "- CSS variable density: ${VARS_PER_KB} vars/MB" >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
else
    echo "No dist/assets directory found for design token analysis"
    echo "- Status: No assets directory found" >> "$REPORT_FILE"
fi

# Build-time Design Token Validation
echo ""
echo -e "${BLUE}🔍 Build-time Token Validation${NC}"

TOKEN_VALIDATION_PASSED=true

if [ -d "dist/assets" ]; then
    echo "### Build-time Token Validation" >> "$REPORT_FILE"

    # Check for unused CSS variables in production build
    TOTAL_DEFINED_VARS=0
    TOTAL_USED_VARS=0

    for css_file in dist/assets/*.css; do
        if [ -f "$css_file" ]; then
            # Count defined CSS variables
            DEFINED_VARS=$(grep -o -- '--[a-zA-Z-]*:' "$css_file" 2>/dev/null | wc -l || echo 0)
            TOTAL_DEFINED_VARS=$((TOTAL_DEFINED_VARS + DEFINED_VARS))

            # Count CSS variable usage (var() references)
            USED_VARS=$(grep -o 'var(--[a-zA-Z-]*)' "$css_file" 2>/dev/null | wc -l || echo 0)
            TOTAL_USED_VARS=$((TOTAL_USED_VARS + USED_VARS))
        fi
    done

    # Calculate usage ratio
    if [ "$TOTAL_DEFINED_VARS" -gt 0 ]; then
        USAGE_RATIO=$(echo "scale=2; $TOTAL_USED_VARS * 100 / $TOTAL_DEFINED_VARS" | bc -l 2>/dev/null || echo "0")
        echo "Design token usage ratio: ${USAGE_RATIO}%"
        echo "- Token usage ratio: ${USAGE_RATIO}%" >> "$REPORT_FILE"

        # Warn if usage ratio is very low (potential unused tokens)
        if (( $(echo "$USAGE_RATIO < 50" | bc -l 2>/dev/null || echo 0) )); then
            echo -e "${YELLOW}⚠️ Low design token usage ratio: ${USAGE_RATIO}%${NC}"
            echo "- Warning: Low token usage ratio detected" >> "$REPORT_FILE"
            TOKEN_VALIDATION_PASSED=false
        fi
    else
        echo "No CSS variables found for validation"
        echo "- Status: No CSS variables found" >> "$REPORT_FILE"
    fi

    # Validate design token chunk exists in production
    DESIGN_TOKEN_CHUNK_EXISTS=false
    for js_file in dist/assets/*.js; do
        if [ -f "$js_file" ] && [[ "$js_file" =~ design-tokens ]]; then
            DESIGN_TOKEN_CHUNK_EXISTS=true
            break
        fi
    done

    if [ "$DESIGN_TOKEN_CHUNK_EXISTS" = true ]; then
        echo "✅ Design token chunk successfully created"
        echo "- Design token chunk: Created successfully" >> "$REPORT_FILE"
    else
        echo -e "${YELLOW}⚠️ Design token chunk not found${NC}"
        echo "- Warning: Design token chunk not found" >> "$REPORT_FILE"
        TOKEN_VALIDATION_PASSED=false
    fi

    # Check for critical design tokens in build
    CRITICAL_TOKENS=("--primary" "--background" "--foreground" "--muted")
    MISSING_CRITICAL=0

    for css_file in dist/assets/*.css; do
        if [ -f "$css_file" ]; then
            for token in "${CRITICAL_TOKENS[@]}"; do
                if ! grep -q "$token:" "$css_file" 2>/dev/null; then
                    MISSING_CRITICAL=$((MISSING_CRITICAL + 1))
                fi
            done
        fi
    done

    if [ "$MISSING_CRITICAL" -eq 0 ]; then
        echo "✅ All critical design tokens found in build"
        echo "- Critical tokens: All present" >> "$REPORT_FILE"
    else
        echo -e "${YELLOW}⚠️ Missing ${MISSING_CRITICAL} critical design tokens${NC}"
        echo "- Warning: ${MISSING_CRITICAL} critical tokens missing" >> "$REPORT_FILE"
        TOKEN_VALIDATION_PASSED=false
    fi

    echo "" >> "$REPORT_FILE"
else
    echo "No dist/assets directory found for token validation"
    echo "- Status: No assets directory found" >> "$REPORT_FILE"
    TOKEN_VALIDATION_PASSED=false
fi

# Bundle size validation (unless skipped)
if [[ "$SKIP_SIZE_CHECK" != "true" ]]; then
    if (( $(echo "$BUNDLE_SIZE_NUM > $BUNDLE_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
        echo -e "${YELLOW}⚠️ Bundle size ${BUNDLE_SIZE_MB}MB exceeds threshold of ${BUNDLE_THRESHOLD}MB${NC}"
        echo "Status: ⚠️ WARNING - Exceeds size threshold" >> "$REPORT_FILE"

        # Provide optimization suggestions
        echo ""
        echo -e "${YELLOW}Bundle Optimization Suggestions:${NC}"
        echo "• Consider code splitting for large components"
        echo "• Review manual chunk configuration in vite.config.ts"
        echo "• Use dynamic imports for rarely used features"
        echo "• Analyze bundle with --analyze flag for detailed breakdown"

        echo "### Optimization Suggestions" >> "$REPORT_FILE"
        echo "- Consider code splitting for large components" >> "$REPORT_FILE"
        echo "- Review manual chunk configuration in vite.config.ts" >> "$REPORT_FILE"
        echo "- Use dynamic imports for rarely used features" >> "$REPORT_FILE"
        echo "- Analyze bundle with --analyze flag for detailed breakdown" >> "$REPORT_FILE"
    else
        echo -e "${GREEN}✅ Bundle size ${BUNDLE_SIZE_MB}MB is within threshold${NC}"
        echo "Status: ✅ PASSED - Within size threshold" >> "$REPORT_FILE"
    fi
else
    echo -e "${BLUE}ℹ️ Bundle size validation skipped${NC}"
    echo "Status: ℹ️ SKIPPED - Size validation disabled" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"

# Bundle analysis and visualization
if [[ "$ANALYZE" == "true" ]]; then
    echo ""
    echo -e "${BLUE}📈 Bundle Analysis${NC}"

    # Check if stats.html was generated
    if [ -f "dist/stats.html" ]; then
        echo -e "${GREEN}✅ Bundle visualizer report generated: dist/stats.html${NC}"
        echo "## Bundle Visualization" >> "$REPORT_FILE"
        echo "Visualizer Report: dist/stats.html" >> "$REPORT_FILE"
        echo "Status: ✅ GENERATED" >> "$REPORT_FILE"

        # Open analyzer if requested
        if [[ "$OPEN_ANALYZER" == "true" ]]; then
            echo -e "${BLUE}🌐 Opening bundle analyzer in browser${NC}"
            if command -v xdg-open &> /dev/null; then
                xdg-open dist/stats.html &
            elif command -v open &> /dev/null; then
                open dist/stats.html &
            else
                echo -e "${YELLOW}⚠️ Cannot auto-open browser. Please open dist/stats.html manually${NC}"
            fi
            echo "Browser Opening: ✅ ATTEMPTED" >> "$REPORT_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️ Bundle visualizer report not found${NC}"
        echo "Status: ⚠️ WARNING - Visualizer report missing" >> "$REPORT_FILE"
    fi

    # Additional bundle analysis
    if command -v npx &> /dev/null; then
        echo ""
        echo -e "${BLUE}📋 Additional Bundle Analysis${NC}"

        # Run bundle-analyzer if available
        if npm list vite-bundle-visualizer &> /dev/null; then
            echo "Running additional bundle analysis..."
            npx vite-bundle-visualizer dist --quiet || echo "Additional analysis failed"
        fi
    fi

    echo "" >> "$REPORT_FILE"
fi

# Final summary
echo ""
echo -e "${BOLD}📋 Build Summary${NC}"
echo -e "${BOLD}===============${NC}"
echo -e "✅ Build completed: ${BUILD_TIME}s"
echo -e "📦 Bundle size: ${BUNDLE_SIZE_MB}MB"
echo -e "🎯 Analysis: $ANALYZE"
echo -e "📊 Report: $REPORT_FILE"

# Final status in report
echo "## Summary" >> "$REPORT_FILE"
echo "| Metric | Value |" >> "$REPORT_FILE"
echo "|--------|-------|" >> "$REPORT_FILE"
echo "| Build Time | ${BUILD_TIME}s |" >> "$REPORT_FILE"
echo "| Bundle Size | ${BUNDLE_SIZE_MB}MB |" >> "$REPORT_FILE"
echo "| Analysis Mode | $ANALYZE |" >> "$REPORT_FILE"
echo "| Threshold | ${BUNDLE_THRESHOLD}MB |" >> "$REPORT_FILE"

# Set appropriate exit code based on bundle size (for quality gates)
if [[ "$SKIP_SIZE_CHECK" != "true" ]]; then
    if (( $(echo "$BUNDLE_SIZE_NUM > $BUNDLE_THRESHOLD" | bc -l 2>/dev/null || echo 0) )); then
        echo "| Status | ⚠️ WARNING - Large Bundle |" >> "$REPORT_FILE"
        echo ""
        echo -e "${YELLOW}Build completed with warnings${NC}"
        exit 0  # Still allow builds with warnings, but log them
    else
        echo "| Status | ✅ SUCCESS |" >> "$REPORT_FILE"
        echo ""
        echo -e "${GREEN}Build completed successfully! 🎉${NC}"
        exit 0
    fi
else
    echo "| Status | ✅ SUCCESS (Size Check Skipped) |" >> "$REPORT_FILE"
    echo ""
    echo -e "${GREEN}Build completed successfully! 🎉${NC}"
    exit 0
fi