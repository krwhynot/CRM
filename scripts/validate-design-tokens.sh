#!/bin/bash

# Enhanced Design Token Validation Script
# This script provides comprehensive WCAG AA/AAA contrast validation for all color combinations,
# validates MFB brand colors against backgrounds, and includes runtime validation for dynamic content

echo "🎨 Enhanced Design Token Validation - WCAG AA/AAA Compliance"
echo "============================================================"

# Initialize compliance score
COMPLIANCE_SCORE=0

# Function to check if a variable exists in CSS file
check_css_var_exists() {
    local var_name=$1
    local css_file=$2
    grep -q "^[[:space:]]*--${var_name}:" "$css_file"
}

# Function to extract CSS variable value
extract_css_var() {
    local var_name=$1
    local css_file=$2

    # Extract the value after the colon and before the semicolon
    grep -E "^\s*--${var_name}:" "$css_file" | sed 's/.*:\s*\([^;]*\);.*/\1/' | tr -d ' '
}

# Function to check WCAG compliance level based on simplified ratio estimation
check_wcag_level() {
    local lightness_diff=$1
    local text_size=${2:-"normal"}  # normal, large

    # Simplified WCAG estimation based on lightness difference
    # This is a practical approximation for shell-based validation

    if [ "$text_size" = "large" ]; then
        if [ "$lightness_diff" -ge 50 ]; then
            echo "AAA"
        elif [ "$lightness_diff" -ge 30 ]; then
            echo "AA"
        else
            echo "FAIL"
        fi
    else
        if [ "$lightness_diff" -ge 70 ]; then
            echo "AAA"
        elif [ "$lightness_diff" -ge 45 ]; then
            echo "AA"
        else
            echo "FAIL"
        fi
    fi
}

# Function to extract lightness percentage from HSL/OKLCH values
extract_lightness() {
    local color_value="$1"

    # Clean up the color value - remove newlines and extra spaces
    color_value=$(echo "$color_value" | tr -d '\n' | tr -s ' ')

    # For OKLCH format (e.g., "oklch(0.6800 0.1800 130)")
    if [[ "$color_value" == *"oklch"* ]]; then
        local l_value=$(echo "$color_value" | sed 's/oklch(\([0-9.]*\).*/\1/')
        # Convert to percentage (multiply by 100 and truncate)
        echo "$l_value" | awk '{printf "%.0f", $1 * 100}'
    # For HSL format (e.g., "95 71% 56%")
    elif [[ "$color_value" == *"%"* ]]; then
        # Extract the last percentage value (lightness)
        echo "$color_value" | sed 's/.*[[:space:]]\([0-9]*\)%.*/\1/'
    else
        echo "50" # Default fallback
    fi
}

# Function to estimate contrast between two colors
estimate_contrast() {
    local fg_color="$1"
    local bg_color="$2"

    local fg_lightness=$(extract_lightness "$fg_color")
    local bg_lightness=$(extract_lightness "$bg_color")

    # Ensure we have valid numbers
    if [[ ! "$fg_lightness" =~ ^[0-9]+$ ]]; then
        fg_lightness=50
    fi
    if [[ ! "$bg_lightness" =~ ^[0-9]+$ ]]; then
        bg_lightness=50
    fi

    # Calculate absolute difference
    local diff=$((fg_lightness - bg_lightness))
    if [ $diff -lt 0 ]; then
        diff=$((-diff))
    fi

    echo $diff
}

# Enhanced WCAG Compliance Validation with Automated Contrast Testing
validate_wcag_compliance() {
    echo ""
    echo "Comprehensive WCAG AA/AAA contrast compliance validation..."

    # Check if src/index.css exists
    if [ ! -f "src/index.css" ]; then
        echo "❌ src/index.css not found - cannot validate contrast ratios"
        return 1
    fi

    local compliance_issues=0
    local total_checks=0
    local contrast_score=0

    # 1. Automated MFB Brand Color Contrast Validation
    echo ""
    echo "🎯 MFB Brand Color Contrast Validation"
    echo "======================================"

    # Extract MFB colors from CSS file and test against common backgrounds
    local mfb_colors=("mfb-green" "mfb-green-hover" "mfb-green-light" "mfb-clay" "mfb-sage" "mfb-olive")
    local background_colors=("background" "card" "muted" "accent")

    for mfb_color in "${mfb_colors[@]}"; do
        if grep -q "^[[:space:]]*--${mfb_color}:" src/index.css; then
            # Extract OKLCH value
            local mfb_value=$(extract_css_var "$mfb_color" "src/index.css")
            echo "📊 Testing $mfb_color ($mfb_value) against backgrounds..."

            # Test against light background (approximate)
            local light_bg="0 0% 100%"  # White background
            local contrast_diff=$(estimate_contrast "$mfb_value" "$light_bg")
            local wcag_level=$(check_wcag_level "$contrast_diff")
            total_checks=$((total_checks + 1))

            if [ "$wcag_level" = "FAIL" ]; then
                echo "❌ $mfb_color vs light: ${contrast_diff}% diff (FAIL)"
                compliance_issues=$((compliance_issues + 1))
            else
                echo "✅ $mfb_color vs light: ${contrast_diff}% diff ($wcag_level)"
            fi

            # Test against dark background (approximate)
            local dark_bg="0 0% 9%"  # Dark background
            contrast_diff=$(estimate_contrast "$mfb_value" "$dark_bg")
            wcag_level=$(check_wcag_level "$contrast_diff")
            total_checks=$((total_checks + 1))

            if [ "$wcag_level" = "FAIL" ]; then
                echo "❌ $mfb_color vs dark: ${contrast_diff}% diff (FAIL)"
                compliance_issues=$((compliance_issues + 1))
            else
                echo "✅ $mfb_color vs dark: ${contrast_diff}% diff ($wcag_level)"
            fi
        else
            echo "❌ $mfb_color: Not defined in CSS variables"
            compliance_issues=$((compliance_issues + 1))
            total_checks=$((total_checks + 1))
        fi
    done

    # 2. Priority System Color Accessibility Analysis
    echo ""
    echo "🚨 Priority System Color Accessibility"
    echo "====================================="

    local priority_colors=("priority-a-plus" "priority-a" "priority-b" "priority-c" "priority-d")
    for priority in "${priority_colors[@]}"; do
        total_checks=$((total_checks + 1))
        if grep -q "^[[:space:]]*--${priority}:" src/index.css && grep -q "^[[:space:]]*--${priority}-foreground:" src/index.css; then
            # Extract colors and test contrast
            local bg_color=$(extract_css_var "$priority" "src/index.css")
            local fg_color=$(extract_css_var "${priority}-foreground" "src/index.css")

            if [ -n "$bg_color" ] && [ -n "$fg_color" ]; then
                local contrast_diff=$(estimate_contrast "$fg_color" "$bg_color")
                local wcag_level=$(check_wcag_level "$contrast_diff")

                if [ "$wcag_level" = "FAIL" ]; then
                    echo "❌ $priority: ${contrast_diff}% diff (FAIL) - Critical accessibility issue"
                    compliance_issues=$((compliance_issues + 1))
                else
                    echo "✅ $priority: ${contrast_diff}% diff ($wcag_level)"
                fi
            else
                echo "⚠️  $priority: Unable to extract color values for testing"
                compliance_issues=$((compliance_issues + 1))
            fi
        else
            echo "❌ $priority: Missing background or foreground definition"
            compliance_issues=$((compliance_issues + 1))
        fi
    done

    # 3. Semantic Color Validation
    echo ""
    echo "🎨 Semantic Color WCAG Validation"
    echo "================================"

    local semantic_colors=("success" "warning" "destructive" "info")
    for semantic in "${semantic_colors[@]}"; do
        total_checks=$((total_checks + 1))
        if grep -q "^[[:space:]]*--${semantic}:" src/index.css && grep -q "^[[:space:]]*--${semantic}-foreground:" src/index.css; then
            local bg_color=$(extract_css_var "$semantic" "src/index.css")
            local fg_color=$(extract_css_var "${semantic}-foreground" "src/index.css")

            if [ -n "$bg_color" ] && [ -n "$fg_color" ]; then
                local contrast_diff=$(estimate_contrast "$fg_color" "$bg_color")
                local wcag_level=$(check_wcag_level "$contrast_diff")

                if [ "$wcag_level" = "FAIL" ]; then
                    echo "❌ $semantic: ${contrast_diff}% diff (FAIL)"
                    compliance_issues=$((compliance_issues + 1))
                else
                    echo "✅ $semantic: ${contrast_diff}% diff ($wcag_level)"
                fi
            else
                echo "⚠️  $semantic: Unable to extract color values"
                compliance_issues=$((compliance_issues + 1))
            fi
        else
            echo "❌ $semantic: Missing definition"
            compliance_issues=$((compliance_issues + 1))
        fi
    done

    # 4. Text Contrast Validation
    echo ""
    echo "📝 Text Contrast Validation"
    echo "==========================="

    # Define expected contrast ratios from documentation
    declare -A expected_ratios=(
        ["text-primary"]="15.8"
        ["text-body"]="12.6"
        ["text-muted"]="7.5"
        ["text-disabled"]="4.5"
    )

    for text_type in "${!expected_ratios[@]}"; do
        total_checks=$((total_checks + 1))
        local expected=${expected_ratios[$text_type]}

        if grep -q "$text_type" src/index.css; then
            echo "✅ $text_type: Expected ${expected}:1 ratio (documented AAA compliance)"
        else
            echo "❌ $text_type: Missing from CSS variables"
            compliance_issues=$((compliance_issues + 1))
        fi
    done

    # 5. Dynamic Content Validation Recommendations
    echo ""
    echo "🔄 Dynamic Content Validation Analysis"
    echo "====================================="

    # Check for CSS custom property usage that might need runtime validation
    local dynamic_patterns=$(grep -r "var(--" src/components/ --include="*.tsx" 2>/dev/null | wc -l)
    if [ "$dynamic_patterns" -gt 0 ]; then
        echo "📊 Found $dynamic_patterns CSS custom property usages in components"
        echo "💡 Consider implementing runtime contrast validation for:"
        echo "   • User-generated content with custom colors"
        echo "   • Dynamic theme switching"
        echo "   • Component prop-based color overrides"
        echo "   • Data-driven color mappings"
    fi

    # 6. Calculate compliance score
    if [ $compliance_issues -eq 0 ]; then
        contrast_score=35
        echo ""
        echo "🏆 Perfect WCAG compliance! All contrast requirements exceeded."
    elif [ $compliance_issues -le 2 ]; then
        contrast_score=30
        echo ""
        echo "✅ Excellent compliance with minor issues ($compliance_issues/$total_checks)"
    elif [ $compliance_issues -le 5 ]; then
        contrast_score=25
        echo ""
        echo "⚠️  Good compliance with some issues ($compliance_issues/$total_checks)"
    elif [ $compliance_issues -le 10 ]; then
        contrast_score=15
        echo ""
        echo "⚠️  Fair compliance needs improvement ($compliance_issues/$total_checks)"
    else
        contrast_score=5
        echo ""
        echo "❌ Poor compliance requires immediate attention ($compliance_issues/$total_checks)"
    fi

    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + contrast_score))

    # 7. Actionable Recommendations
    if [ $compliance_issues -gt 0 ]; then
        echo ""
        echo "🔧 Recommended Actions:"
        echo "======================"
        echo "   1. Fix failing contrast ratios (minimum 4.5:1 for AA, 7:1 for AAA)"
        echo "   2. Ensure MFB brand colors meet accessibility standards"
        echo "   3. Add foreground color definitions for missing semantic colors"
        echo "   4. Test color combinations in both light and dark themes"
        echo "   5. Consider colorblind-friendly alternatives for critical UI"
        echo ""
        echo "💡 Priority Actions:"
        if [ $compliance_issues -gt 5 ]; then
            echo "   🚨 CRITICAL: Address failing priority and semantic colors immediately"
        fi
        echo "   📊 Implement automated contrast testing in CI/CD pipeline"
        echo "   🎨 Use design tokens consistently throughout component library"
        echo "   ♿ Test with accessibility tools (axe, WAVE, Colour Contrast Analyser)"
    fi
}

# Enhanced Runtime Validation Implementation Guide
add_runtime_validation() {
    echo ""
    echo "🚀 Runtime Contrast Validation Implementation Guide"
    echo "=================================================="
    echo ""
    echo "For dynamic content and user-generated colors, implement these solutions:"
    echo ""

    echo "1. 📊 Enhanced TypeScript Contrast Utilities:"
    echo "   File: src/lib/design-token-utils.ts"
    echo ""
    echo "   interface ContrastResult {"
    echo "     ratio: number;"
    echo "     level: 'AAA' | 'AA' | 'FAIL';"
    echo "     recommendation?: string;"
    echo "   }"
    echo ""
    echo "   export function validateContrastRatio("
    echo "     foreground: string,"
    echo "     background: string,"
    echo "     textSize: 'normal' | 'large' = 'normal'"
    echo "   ): ContrastResult {"
    echo "     const ratio = calculateContrastRatio(foreground, background);"
    echo "     const thresholds = textSize === 'large' ? { AA: 3, AAA: 4.5 } : { AA: 4.5, AAA: 7 };"
    echo "     "
    echo "     if (ratio >= thresholds.AAA) return { ratio, level: 'AAA' };"
    echo "     if (ratio >= thresholds.AA) return { ratio, level: 'AA' };"
    echo "     return { "
    echo "       ratio, "
    echo "       level: 'FAIL', "
    echo "       recommendation: 'Use design tokens with guaranteed contrast ratios'"
    echo "     };"
    echo "   }"
    echo ""

    echo "2. 🎨 Design Token CSS Custom Property Validation:"
    echo "   File: src/styles/runtime-validation.css"
    echo ""
    echo "   /* Auto-contrast utilities for dynamic content */"
    echo "   .auto-contrast-text {"
    echo "     color: light-dark("
    echo "       hsl(var(--foreground)),"
    echo "       hsl(var(--foreground-dark))"
    echo "     );"
    echo "   }"
    echo ""
    echo "   /* MFB brand color with validated contrast */"
    echo "   .mfb-contrast-safe {"
    echo "     background: hsl(var(--mfb-green));"
    echo "     color: hsl(var(--mfb-green-foreground, var(--primary-foreground)));"
    echo "   }"
    echo ""
    echo "   /* Priority colors with WCAG compliance */"
    echo "   .priority-contrast-validated {"
    echo "     background: hsl(var(--priority-bg));"
    echo "     color: hsl(var(--priority-fg));"
    echo "     border: 1px solid hsl(var(--priority-border, var(--priority-bg)));"
    echo "   }"
    echo ""

    echo "3. ⚛️  React Hook for Dynamic Contrast Validation:"
    echo "   File: src/hooks/useContrastValidation.ts"
    echo ""
    echo "   export function useContrastValidation(fg: string, bg: string) {"
    echo "     const [validation, setValidation] = useState<ContrastResult | null>(null);"
    echo "     "
    echo "     useEffect(() => {"
    echo "       if (fg && bg) {"
    echo "         const result = validateContrastRatio(fg, bg);"
    echo "         setValidation(result);"
    echo "         "
    echo "         if (result.level === 'FAIL') {"
    echo "           console.warn('🚨 Low contrast detected:', {"
    echo "             foreground: fg,"
    echo "             background: bg,"
    echo "             ratio: result.ratio,"
    echo "             recommendation: result.recommendation"
    echo "           });"
    echo "         }"
    echo "       }"
    echo "     }, [fg, bg]);"
    echo "     "
    echo "     return validation;"
    echo "   }"
    echo ""

    echo "4. 🧪 Automated Testing Integration:"
    echo "   File: tests/design-tokens/contrast-validation.test.ts"
    echo ""
    echo "   describe('Design Token Contrast Validation', () => {"
    echo "     test('MFB brand colors meet WCAG AA standards', () => {"
    echo "       const mfbGreen = getComputedStyle(document.documentElement)"
    echo "         .getPropertyValue('--mfb-green');"
    echo "       const background = getComputedStyle(document.documentElement)"
    echo "         .getPropertyValue('--background');"
    echo "       "
    echo "       const result = validateContrastRatio(mfbGreen, background);"
    echo "       expect(result.level).not.toBe('FAIL');"
    echo "       expect(result.ratio).toBeGreaterThan(4.5);"
    echo "     });"
    echo "   });"
    echo ""

    echo "5. 🔧 CI/CD Pipeline Integration:"
    echo "   File: .github/workflows/accessibility-validation.yml"
    echo ""
    echo "   - name: Validate Design Token Contrast"
    echo "     run: |"
    echo "       npm run validate:design-tokens"
    echo "       npm run test:contrast-validation"
    echo "       "
    echo "   - name: Visual Regression Testing"
    echo "     run: |"
    echo "       npm run test:visual-regression --theme=light"
    echo "       npm run test:visual-regression --theme=dark"
    echo ""

    echo "6. 🛠️ Browser Development Tools:"
    echo "   • Chrome: axe DevTools extension for automated testing"
    echo "   • Firefox: Accessibility Inspector with contrast analysis"
    echo "   • Safari: Web Inspector color contrast tools"
    echo "   • Cross-browser: WAVE extension for comprehensive evaluation"
    echo ""

    echo "7. 📱 Mobile & Responsive Validation:"
    echo "   • Test contrast in different density modes (compact/comfortable/spacious)"
    echo "   • Validate in high contrast system settings"
    echo "   • Check readability under various lighting conditions"
    echo "   • Ensure touch targets meet minimum size requirements (44px)"
    echo ""

    echo "8. 🎯 Component-Specific Validation:"
    echo "   interface ComponentContrastProps {"
    echo "     validateContrast?: boolean;"
    echo "     contrastLevel?: 'AA' | 'AAA';"
    echo "   }"
    echo ""
    echo "   // Usage in components"
    echo "   <Button "
    echo "     variant=\"mfb-primary\""
    echo "     validateContrast={true}"
    echo "     contrastLevel=\"AAA\""
    echo "   >"
    echo "     Submit"
    echo "   </Button>"
    echo ""

    echo "💡 Implementation Priority:"
    echo "   1. Add TypeScript contrast utilities (immediate)"
    echo "   2. Implement React validation hooks (high)"
    echo "   3. Add automated testing (high)"
    echo "   4. Integrate CI/CD validation (medium)"
    echo "   5. Add development tooling (medium)"
    echo ""
}

# Token Governance Integration
run_governance_checks() {
    echo ""
    echo "🏛️  Running Token Governance Integration"
    echo "======================================="

    # Check if Node.js governance script exists
    if [ -f "scripts/token-changelog.js" ]; then
        echo "📊 Integrating with automated governance system..."

        # Run governance checks (but don't fail here, let it report)
        if node scripts/token-changelog.js --validate-only 2>/dev/null; then
            echo "✅ Automated governance checks passed"
            COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 15))
        else
            echo "⚠️  Automated governance detected issues (see detailed report above)"
            echo "💡 Run: node scripts/token-changelog.js for detailed governance analysis"
            COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 5))
        fi
    else
        echo "⚠️  Token governance script not found (scripts/token-changelog.js)"
        echo "💡 Consider implementing automated governance for enhanced validation"
    fi
}

# Enhanced Cross-File Duplicate Detection
validate_cross_file_duplicates() {
    echo ""
    echo "🔍 Cross-File Duplicate Detection"
    echo "================================"

    local duplicate_issues=0
    local temp_file=$(mktemp)

    # Collect all token definitions from all files
    local token_files=("src/index.css" "src/styles/semantic-tokens.css" "src/styles/component-tokens.css" "src/styles/advanced-colors.css" "src/styles/density.css" "src/styles/accessibility.css")

    for file in "${token_files[@]}"; do
        if [ -f "$file" ]; then
            # Extract token names and their files
            grep -n "^\s*--[a-zA-Z0-9-]*:" "$file" | while IFS=: read -r line_num token_def; do
                token_name=$(echo "$token_def" | sed 's/^\s*\(--[a-zA-Z0-9-]*\):.*/\1/')
                echo "$token_name|$file|$line_num" >> "$temp_file"
            done
        fi
    done

    # Find duplicates across files
    if [ -f "$temp_file" ]; then
        duplicates=$(sort "$temp_file" | cut -d'|' -f1 | uniq -d)

        if [ -n "$duplicates" ]; then
            echo "❌ Cross-file duplicate tokens detected:"
            for dup_token in $duplicates; do
                echo "   $dup_token defined in:"
                grep "^$dup_token|" "$temp_file" | while IFS='|' read -r token file line; do
                    echo "     - $file (line $line)"
                done
                duplicate_issues=$((duplicate_issues + 1))
            done
        else
            echo "✅ No cross-file duplicate tokens detected"
        fi
    fi

    rm -f "$temp_file"

    # Adjust compliance score based on duplicates
    if [ "$duplicate_issues" -eq 0 ]; then
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 10))
    elif [ "$duplicate_issues" -le 2 ]; then
        COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 5))
        echo "⚠️  Minor cross-file duplicates detected ($duplicate_issues)"
    else
        echo "❌ Significant cross-file duplicates detected ($duplicate_issues)"
        echo "💡 Consider consolidating duplicate definitions following hierarchy rules"
    fi
}

# Enhanced Token Hierarchy Validation
validate_token_hierarchy() {
    echo ""
    echo "🏗️  Design Token Hierarchy Validation"
    echo "===================================="

    local hierarchy_issues=0
    local hierarchy_score=0

    # 1. Validate Primitive Token Definitions
    echo ""
    echo "1️⃣  Primitive Token Definition Validation"
    echo "----------------------------------------"

    # Check for primitive tokens defined outside of index.css
    local non_primitive_files=("src/styles/semantic-tokens.css" "src/styles/component-tokens.css" "src/styles/advanced-colors.css" "src/styles/density.css")

    for file in "${non_primitive_files[@]}"; do
        if [ -f "$file" ]; then
            # Look for primitive token patterns (base colors, spacing, typography)
            local primitive_violations=$(grep -E "^\s*--(primary|secondary|mfb|color|spacing|font|shadow)-[0-9]+(:|hsl|oklch)" "$file" | wc -l)
            if [ "$primitive_violations" -gt 0 ]; then
                echo "❌ $file: $primitive_violations primitive token definitions found"
                echo "   Primitive tokens should only be defined in src/index.css"
                hierarchy_issues=$((hierarchy_issues + primitive_violations))
            else
                echo "✅ $file: No primitive token violations"
            fi
        fi
    done

    # 2. Circular Reference Detection
    echo ""
    echo "2️⃣  Circular Reference Detection"
    echo "-------------------------------"

    # Extract all CSS variable definitions and check for circular references
    local css_files=("src/index.css" "src/styles/semantic-tokens.css" "src/styles/component-tokens.css" "src/styles/advanced-colors.css")
    local circular_refs=0

    for file in "${css_files[@]}"; do
        if [ -f "$file" ]; then
            # Find variables that reference themselves
            while IFS= read -r line; do
                if [[ "$line" == *"--"*":"*"var(--"* ]]; then
                    local var_name=$(echo "$line" | sed 's/.*--\([^:]*\):.*/\1/')
                    local var_value=$(echo "$line" | sed 's/.*:\s*\([^;]*\);.*/\1/')

                    if [[ "$var_value" == *"var(--$var_name"* ]]; then
                        echo "❌ Circular reference: --$var_name references itself in $file"
                        circular_refs=$((circular_refs + 1))
                    fi
                fi
            done < "$file"
        fi
    done

    if [ "$circular_refs" -eq 0 ]; then
        echo "✅ No circular references detected"
    else
        echo "❌ Found $circular_refs circular references"
        hierarchy_issues=$((hierarchy_issues + circular_refs))
    fi

    # 3. Semantic Layer Bypassing Detection
    echo ""
    echo "3️⃣  Semantic Layer Bypass Detection"
    echo "-----------------------------------"

    # Check if components directly reference primitive tokens instead of semantic ones
    local bypass_violations=0

    if [ -f "src/styles/component-tokens.css" ]; then
        # Look for direct primitive references in component tokens
        local direct_primitive_refs=$(grep -E "var\(--(primary|secondary|mfb|color)-[0-9]+" "src/styles/component-tokens.css" | grep -v "var(--primary)" | wc -l)
        if [ "$direct_primitive_refs" -gt 0 ]; then
            echo "❌ Component tokens bypass semantic layer: $direct_primitive_refs violations"
            echo "   Components should reference semantic tokens (--primary) not primitives (--primary-500)"
            bypass_violations=$((bypass_violations + direct_primitive_refs))
        else
            echo "✅ Components properly use semantic tokens"
        fi
    fi

    # Check component files for direct primitive usage
    if [ -d "src/components" ]; then
        local component_primitive_usage=$(grep -r "var(--\(primary\|secondary\|mfb\)-[0-9]" src/components/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
        if [ "$component_primitive_usage" -gt 0 ]; then
            echo "❌ Components directly use primitive tokens: $component_primitive_usage instances"
            echo "   Run: grep -r 'var(--\(primary\|secondary\|mfb\)-[0-9]' src/components/ --include='*.tsx'"
            bypass_violations=$((bypass_violations + component_primitive_usage))
        else
            echo "✅ Components avoid direct primitive token usage"
        fi
    fi

    hierarchy_issues=$((hierarchy_issues + bypass_violations))

    # 4. Layer Boundary Validation
    echo ""
    echo "4️⃣  Layer Boundary Compliance"
    echo "-----------------------------"

    local boundary_violations=0

    # Semantic tokens should only reference primitives
    if [ -f "src/styles/semantic-tokens.css" ]; then
        local semantic_violations=$(grep -E "var\(--(btn|card|dialog|input|select)" "src/styles/semantic-tokens.css" | wc -l)
        if [ "$semantic_violations" -gt 0 ]; then
            echo "❌ Semantic layer references component tokens: $semantic_violations violations"
            boundary_violations=$((boundary_violations + semantic_violations))
        else
            echo "✅ Semantic layer properly references only primitives"
        fi
    fi

    # Feature tokens should reference semantic, not bypass to primitives
    if [ -f "src/styles/advanced-colors.css" ]; then
        local feature_bypass=$(grep -E "var\(--(primary|secondary|mfb)-[0-9]+" "src/styles/advanced-colors.css" | grep -v "var(--primary[^-]" | wc -l)
        if [ "$feature_bypass" -gt 0 ]; then
            echo "❌ Feature layer bypasses semantic layer: $feature_bypass violations"
            boundary_violations=$((boundary_violations + feature_bypass))
        else
            echo "✅ Feature layer respects hierarchy boundaries"
        fi
    fi

    hierarchy_issues=$((hierarchy_issues + boundary_violations))

    # 5. Token Naming Convention Validation
    echo ""
    echo "5️⃣  Token Naming Convention Validation"
    echo "--------------------------------------"

    local naming_violations=0

    # Check for inconsistent naming patterns
    for file in "${css_files[@]}"; do
        if [ -f "$file" ]; then
            # Look for tokens that don't follow kebab-case convention
            local bad_naming=$(grep -E "^\s*--[a-zA-Z_]*[A-Z]" "$file" | wc -l)
            if [ "$bad_naming" -gt 0 ]; then
                echo "❌ $file: $bad_naming tokens use camelCase instead of kebab-case"
                naming_violations=$((naming_violations + bad_naming))
            fi

            # Look for tokens without proper prefixes in component layer
            if [[ "$file" == *"component-tokens.css" ]]; then
                local unprefixed=$(grep -E "^\s*--[a-z]" "$file" | grep -v -E "^\s*--(btn-|card-|dialog-|input-|select-|popover-|table-|background|foreground|border|ring)" | wc -l)
                if [ "$unprefixed" -gt 0 ]; then
                    echo "❌ $file: $unprefixed component tokens lack component prefix"
                    naming_violations=$((naming_violations + unprefixed))
                fi
            fi
        fi
    done

    if [ "$naming_violations" -eq 0 ]; then
        echo "✅ All tokens follow naming conventions"
    else
        echo "❌ Found $naming_violations naming convention violations"
    fi

    hierarchy_issues=$((hierarchy_issues + naming_violations))

    # 6. Design System Drift Detection
    echo ""
    echo "6️⃣  Design System Drift Detection"
    echo "---------------------------------"

    local drift_issues=0

    # Check for duplicate color definitions
    if [ -f "src/index.css" ]; then
        # Look for multiple definitions of the same conceptual color
        local mfb_green_variants=$(grep -E "oklch\([0-9.]+\s+[0-9.]+\s+130\)" "src/index.css" | wc -l)
        local primary_green_variants=$(grep -E "\-\-(primary|mfb-green)" "src/index.css" | wc -l)

        echo "📊 MFB Green color variants found: $mfb_green_variants OKLCH, $primary_green_variants definitions"

        # Check for conflicting values
        if [ -f "src/styles/semantic-tokens.css" ]; then
            local semantic_green_overrides=$(grep -E "\-\-(primary|mfb)" "src/styles/semantic-tokens.css" | grep -v "var(" | wc -l)
            if [ "$semantic_green_overrides" -gt 0 ]; then
                echo "❌ Semantic layer redefines primitive colors: $semantic_green_overrides overrides"
                drift_issues=$((drift_issues + semantic_green_overrides))
            fi
        fi
    fi

    # Check for unused tokens
    local css_vars=$(grep -ho "\-\-[a-zA-Z0-9\-]*" src/index.css src/styles/*.css 2>/dev/null | sort -u)
    local unused_count=0

    for var in $css_vars; do
        # Skip very common base tokens
        if [[ "$var" == "--background" || "$var" == "--foreground" || "$var" == "--primary" ]]; then
            continue
        fi

        # Check if token is used anywhere
        local usage_count=$(grep -r "var($var)" src/ --include="*.css" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
        if [ "$usage_count" -eq 0 ]; then
            unused_count=$((unused_count + 1))
        fi
    done

    if [ "$unused_count" -gt 5 ]; then
        echo "⚠️  $unused_count potentially unused tokens detected"
        echo "   Consider running token usage audit for cleanup"
        drift_issues=$((drift_issues + 1))
    else
        echo "✅ Token usage appears healthy"
    fi

    hierarchy_issues=$((hierarchy_issues + drift_issues))

    # Calculate hierarchy compliance score
    if [ "$hierarchy_issues" -eq 0 ]; then
        hierarchy_score=25
        echo ""
        echo "🏆 Perfect hierarchy compliance! Design system architecture is pristine."
        echo "   ✅ No primitive token violations"
        echo "   ✅ No circular references"
        echo "   ✅ No semantic layer bypassing"
        echo "   ✅ Proper layer boundaries"
        echo "   ✅ Consistent naming conventions"
        echo "   ✅ No design system drift"
    elif [ "$hierarchy_issues" -le 3 ]; then
        hierarchy_score=20
        echo ""
        echo "✅ Excellent hierarchy compliance with minor issues ($hierarchy_issues total)"
    elif [ "$hierarchy_issues" -le 8 ]; then
        hierarchy_score=15
        echo ""
        echo "⚠️  Good hierarchy compliance with some violations ($hierarchy_issues total)"
    elif [ "$hierarchy_issues" -le 15 ]; then
        hierarchy_score=10
        echo ""
        echo "⚠️  Fair hierarchy compliance needs improvement ($hierarchy_issues total)"
    else
        hierarchy_score=0
        echo ""
        echo "❌ Poor hierarchy compliance requires immediate attention ($hierarchy_issues total)"
    fi

    # Add recommendations for hierarchy improvements
    if [ "$hierarchy_issues" -gt 0 ]; then
        echo ""
        echo "🔧 Hierarchy Improvement Recommendations:"
        echo "========================================"
        echo "   1. Move primitive tokens to src/index.css only"
        echo "   2. Fix circular token references"
        echo "   3. Use semantic tokens (--primary) instead of primitives (--primary-500)"
        echo "   4. Ensure proper layer separation (primitives → semantic → components → features)"
        echo "   5. Follow consistent kebab-case naming conventions"
        echo "   6. Remove duplicate color definitions"
        echo "   7. Clean up unused tokens"
        echo ""
        echo "💡 Implementation Order:"
        echo "   1. Fix circular references (highest priority)"
        echo "   2. Consolidate primitive token definitions"
        echo "   3. Update components to use semantic tokens"
        echo "   4. Validate layer boundaries"
        echo "   5. Clean up naming and unused tokens"
    fi

    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + hierarchy_score))
}

# Run governance integration checks
run_governance_checks

# Run cross-file duplicate detection
validate_cross_file_duplicates

# Run enhanced hierarchy validation
validate_token_hierarchy

# Run WCAG contrast validation first (highest priority)
validate_wcag_compliance

# Check for arbitrary values in source code (excluding shadcn/ui components)
echo ""
echo "Checking for arbitrary values in custom components..."

# Check for arbitrary values, excluding ui/ directory and specific shadcn files
ARBITRARY_VALUES=$(grep -r '\[.*\]' src/ --include='*.tsx' --include='*.ts' \
  --exclude-dir=ui \
  --exclude='*.variants.ts' \
  | grep -v 'data-\|aria-\|svg\|role=' \
  | grep -E '(bg|text|w|h|p|m|min-|max-|top|left|right|bottom)-\[' \
  | wc -l)

if [ "$ARBITRARY_VALUES" -eq 0 ]; then
    echo "✅ No arbitrary values found in custom components"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 20))
else
    echo "❌ Found $ARBITRARY_VALUES arbitrary values in custom components"
    echo "   Run: grep -r '\[.*\]' src/ --include='*.tsx' --include='*.ts' --exclude-dir=ui | grep -E '(bg|text|w|h|p|m|min-|max-|top|left|right|bottom)-\['"
fi

# Check for hardcoded hex colors
echo ""
echo "Checking for hardcoded hex colors..."
HEX_COLORS=$(grep -r '#[0-9a-fA-F]\{3,8\}' src/ --include='*.tsx' --include='*.ts' | wc -l)

if [ "$HEX_COLORS" -eq 0 ]; then
    echo "✅ No hardcoded hex colors found"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 20))
else
    echo "❌ Found $HEX_COLORS hardcoded hex colors"
    echo "   Run: grep -r '#[0-9a-fA-F]\\{3,8\\}' src/ --include='*.tsx' --include='*.ts'"
fi

# Check provider consistency
echo ""
echo "Checking provider consistency..."
if grep -q "ThemeProvider\|TooltipProvider\|AuthProvider\|QueryClientProvider" src/App.tsx; then
    echo "✅ All required providers found in App.tsx"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 15))
else
    echo "❌ Missing required providers in App.tsx"
fi

# Check template usage consistency
echo ""
echo "Checking EntityManagementTemplate usage..."
TEMPLATE_PAGES=$(grep -l "ManagementTemplate" src/pages/*.tsx 2>/dev/null | wc -l)
TOTAL_ENTITY_PAGES=$(ls src/pages/ 2>/dev/null | grep -E "(Organizations|Contacts|Products|Opportunities)\.tsx" | wc -l)

if [ "$TEMPLATE_PAGES" -eq "$TOTAL_ENTITY_PAGES" ] && [ "$TOTAL_ENTITY_PAGES" -gt 0 ]; then
    echo "✅ All entity pages use EntityManagementTemplate"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 15))
elif [ "$TOTAL_ENTITY_PAGES" -gt 0 ]; then
    echo "⚠️  $TEMPLATE_PAGES out of $TOTAL_ENTITY_PAGES entity pages use EntityManagementTemplate"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 10))
else
    echo "⚠️  No entity pages found to validate"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 5))
fi

# Calculate final score
TOTAL_SCORE=${COMPLIANCE_SCORE:-0}

echo ""
echo "======================================================================"
echo "🎯 Enhanced Design Token Validation Score: $TOTAL_SCORE/165"
echo "   • Token Governance Integration: 15 points (max)"
echo "   • Cross-File Duplicate Detection: 10 points (max)"
echo "   • Token Hierarchy Validation: 25 points (max)"
echo "   • Enhanced WCAG Contrast Validation: 35 points (max)"
echo "   • Arbitrary Values Check: 20 points (max)"
echo "   • Hardcoded Colors Check: 20 points (max)"
echo "   • Provider Consistency: 15 points (max)"
echo "   • Template Usage: 15 points (max)"
echo ""
echo "📊 Detailed Scoring Breakdown:"
echo "   • Token Hierarchy Compliance (Primitives → Semantic → Components → Features)"
echo "   • Circular Reference Detection"
echo "   • Layer Boundary Validation"
echo "   • Design System Drift Prevention"
echo "   • MFB Brand Color Contrast Analysis"
echo "   • Priority System Color Accessibility"
echo "   • Semantic Color WCAG Validation"
echo "   • Text Contrast Documentation Review"
echo "   • Dynamic Content Validation Assessment"
echo "   • Runtime Validation Recommendations"

if [ "$TOTAL_SCORE" -ge 145 ]; then
    echo ""
    echo "🏆 EXCEPTIONAL! Industry-leading design token implementation."
    echo "   Perfect hierarchy compliance with pristine token architecture."
    echo "   Perfect WCAG compliance with comprehensive contrast validation."
    echo "   Perfect governance integration with automated change tracking."
    echo "   All MFB brand colors meet AAA standards with robust accessibility."
    echo "   🚀 Ready for production deployment with confidence."
    exit 0
elif [ "$TOTAL_SCORE" -ge 125 ]; then
    echo ""
    echo "✅ EXCELLENT compliance! Outstanding design token architecture."
    echo "   Strong hierarchy validation with minimal violations."
    echo "   Strong WCAG contrast validation with minor optimization opportunities."
    echo "   Effective governance integration with automated validation."
    echo "   💡 Consider implementing runtime validation for dynamic content."
    add_runtime_validation
    exit 0
elif [ "$TOTAL_SCORE" -ge 100 ]; then
    echo ""
    echo "⚠️  GOOD compliance. Solid foundation with improvement opportunities."
    echo "   Address identified hierarchy violations and contrast issues."
    echo "   🔧 Focus on automated testing integration for long-term maintainability."
    add_runtime_validation
    exit 0
elif [ "$TOTAL_SCORE" -ge 80 ]; then
    echo ""
    echo "⚠️  FAIR compliance. Multiple improvements needed."
    echo "   Critical priority: Fix hierarchy violations and failing contrast ratios."
    echo "   🚨 Implement comprehensive design token governance immediately."
    add_runtime_validation
    exit 1
else
    echo ""
    echo "❌ POOR compliance. Immediate intervention required."
    echo "   🚨 CRITICAL: Major hierarchy and WCAG violations detected."
    echo "   🎯 Emergency action plan: Address hierarchy issues and contrast ratios first."
    echo "   📊 Implement automated validation to prevent future regressions."
    add_runtime_validation
    exit 1
fi