#!/bin/bash

# UI/UX Compliance Validation Script
# This script checks for arbitrary Tailwind values in custom components (excluding shadcn/ui primitives)

echo "🎨 UI/UX Compliance Audit - Design Token Validation"
echo "=================================================="

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
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 25))
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
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 25))
else
    echo "❌ Found $HEX_COLORS hardcoded hex colors"
    echo "   Run: grep -r '#[0-9a-fA-F]\\{3,8\\}' src/ --include='*.tsx' --include='*.ts'"
fi

# Check provider consistency
echo ""
echo "Checking provider consistency..."
if grep -q "ThemeProvider\|TooltipProvider\|AuthProvider\|QueryClientProvider" src/App.tsx; then
    echo "✅ All required providers found in App.tsx"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 25))
else
    echo "❌ Missing required providers in App.tsx"
fi

# Check template usage consistency
echo ""
echo "Checking EntityManagementTemplate usage..."
TEMPLATE_PAGES=$(grep -l "ManagementTemplate" src/pages/*.tsx | wc -l)
TOTAL_ENTITY_PAGES=$(ls src/pages/ | grep -E "(Organizations|Contacts|Products|Opportunities)\.tsx" | wc -l)

if [ "$TEMPLATE_PAGES" -eq "$TOTAL_ENTITY_PAGES" ]; then
    echo "✅ All entity pages use EntityManagementTemplate"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 25))
else
    echo "⚠️  $TEMPLATE_PAGES out of $TOTAL_ENTITY_PAGES entity pages use EntityManagementTemplate"
    COMPLIANCE_SCORE=$((COMPLIANCE_SCORE + 15))
fi

# Calculate final score
TOTAL_SCORE=${COMPLIANCE_SCORE:-0}

echo ""
echo "=================================================="
echo "🎯 UI/UX Compliance Score: $TOTAL_SCORE/100"

if [ "$TOTAL_SCORE" -ge 90 ]; then
    echo "🏆 Excellent compliance! Your UI/UX is highly consistent."
    exit 0
elif [ "$TOTAL_SCORE" -ge 75 ]; then
    echo "✅ Good compliance. Minor improvements needed."
    exit 0
elif [ "$TOTAL_SCORE" -ge 60 ]; then
    echo "⚠️  Fair compliance. Several improvements needed."
    exit 1
else
    echo "❌ Poor compliance. Major improvements needed."
    exit 1
fi