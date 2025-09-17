# Architecture Validation Rules Research

Comprehensive analysis of ESLint configuration and test architecture validation rules that impact shared component migration strategy.

## Relevant Files
- `/.eslintrc.cjs`: Main ESLint configuration with custom architectural rules
- `/.eslintrc.component-organization.js`: Component organization specific ESLint rules
- `/tests/architecture/component-placement.test.ts`: Component placement validation tests
- `/tests/architecture/eslint-rules.test.ts`: ESLint custom rules testing framework
- `/tests/architecture/state-boundaries.test.ts`: State management boundary validation
- `/scripts/run-quality-gates.sh`: 6-stage quality validation pipeline
- `/scripts/analyze-component-usage.js`: Component usage analytics and health scoring
- `/package.json`: Architecture validation npm scripts

## Architectural Patterns

### **ESLint Import Restriction System**
- **Location**: `.eslintrc.cjs` lines 89-118
- **Pattern**: `no-restricted-imports` with pattern-based blocking
- **Current Rules**: Blocks cross-feature component imports, deprecated components, direct Supabase usage

### **Component Placement Validation**
- **Location**: `tests/architecture/component-placement.test.ts`
- **Pattern**: Automated testing of component directory placement based on usage patterns
- **Validation**: Shared vs feature-specific placement, naming conventions, import patterns

### **Quality Gates Health Scoring**
- **Location**: `scripts/run-quality-gates.sh` + `scripts/analyze-component-usage.js`
- **Pattern**: 80%+ architecture health score requirement for CI/CD
- **Metrics**: Component placement accuracy, usage patterns, architectural compliance

### **State Boundary Enforcement**
- **Location**: `tests/architecture/state-boundaries.test.ts` + `.eslintrc.cjs` lines 121-135
- **Pattern**: Prevents server data fields in Zustand stores, enforces TanStack Query separation
- **Validation**: AST-based detection of inappropriate state mixing

## Edge Cases & Gotchas

### **Custom ESLint Plugin Not Fully Implemented**
- Custom rules in `.eslintrc.cjs` lines 146-148 are commented out
- `crm-architecture/*` rules exist in tests but not in actual plugin
- **Impact**: Some architectural enforcement relies on `no-restricted-syntax` workarounds

### **Component Organization Rules in Separate File**
- `.eslintrc.component-organization.js` contains additional rules not integrated into main config
- Suggests architectural rules were planned but not fully deployed
- **Gotcha**: Rules may need manual integration during shared component migration

### **Health Score Calculation Complexity**
- `analyze-component-usage.js` uses grep-based analysis that may miss dynamic imports
- Health score depends on file naming patterns and directory structure
- **Edge Case**: Dynamically imported components might not be counted correctly

### **Test Architecture vs Production Rules Mismatch**
- Tests validate rules that aren't enforced in production ESLint config
- `tests/architecture/eslint-rules.test.ts` tests custom plugin functionality that's disabled
- **Risk**: False confidence in architectural enforcement

## Current Enforcement Mechanisms

### **1. Import Pattern Restrictions**
```javascript
// Active rules in .eslintrc.cjs
'no-restricted-imports': ['error', {
  patterns: [
    {
      group: ['@/features/*/components/*'],
      message: 'Feature-specific imports should use relative paths within the same feature'
    }
  ]
}]
```

### **2. AST-Based State Validation**
```javascript
// Server data detection in Zustand stores
'no-restricted-syntax': [
  'error',
  {
    selector: "TSPropertySignature[key.name=/^(created_at|updated_at|deleted_at|id)$/]",
    message: 'Server data fields should not be defined in client state interfaces'
  }
]
```

### **3. Component Usage Analytics**
- Real-time analysis of component cross-feature usage
- Automated recommendations for component relocation
- Health scoring based on proper architectural placement

### **4. Quality Gates Pipeline**
- 7 validation stages including architecture health check
- 80% minimum health score requirement
- Bundle size validation (<3MB threshold)
- Comprehensive reporting with failure details

### **5. Test-Driven Architecture Validation**
- Vitest-based architecture boundary tests
- Component placement rule validation
- Performance pattern enforcement
- Import restriction testing

## Rule Updates Needed for Shared Component Strategy

### **High Priority Changes**

#### **1. Update Import Restriction Patterns**
**File**: `.eslintrc.cjs` lines 95-117
**Current Issue**: Blocks all cross-feature component imports
**Recommended Change**:
```javascript
patterns: [
  {
    group: ['@/features/*/components/*'],
    message: 'Feature-specific imports should use relative paths within the same feature, or be moved to shared components.',
    // Add exception for explicitly shared components
    except: ['@/features/*/components/shared/*']
  }
]
```

#### **2. Integrate Component Organization Rules**
**File**: `.eslintrc.component-organization.js` → `.eslintrc.cjs`
**Action**: Merge rules from separate file into main configuration
**Impact**: Enables feature boundary enforcement that's currently disabled

#### **3. Update Component Placement Test Expectations**
**File**: `tests/architecture/component-placement.test.ts` lines 34-60
**Current Issue**: Tests assume strict feature isolation
**Recommended Change**: Update shared component detection patterns to allow strategic cross-feature components

### **Medium Priority Changes**

#### **4. Enhance Health Score Calculation**
**File**: `scripts/analyze-component-usage.js` lines 205-241
**Current Issue**: Doesn't account for intentionally shared components
**Recommended Change**: Add whitelist for strategically shared components in health scoring

#### **5. Update Custom ESLint Plugin References**
**Files**: `tests/architecture/eslint-rules.test.ts`, `.eslintrc.cjs`
**Action**: Either implement the custom plugin or remove references to prevent confusion

### **Low Priority Changes**

#### **6. Quality Gates Threshold Adjustment**
**File**: `scripts/run-quality-gates.sh` line 76
**Current**: 80% architecture health requirement
**Consider**: Temporarily lower threshold during migration phase

#### **7. Component Co-location Rule Updates**
**File**: `tests/architecture/component-placement.test.ts` lines 262-281
**Action**: Define rules for acceptable component groupings in shared directories

## Implementation Recommendations

### **Phase 1: Pre-Migration Setup**
1. Integrate `.eslintrc.component-organization.js` rules into main config
2. Update import restriction patterns to allow shared component exceptions
3. Create whitelist of intentionally shared components for health scoring

### **Phase 2: Migration Support**
1. Temporarily lower quality gate thresholds if needed
2. Update component placement tests to expect new shared component patterns
3. Add migration-specific ESLint rule exceptions

### **Phase 3: Post-Migration Cleanup**
1. Re-enable strict architectural rules with new shared component awareness
2. Remove temporary rule exceptions
3. Validate final architecture health scores meet original standards

### **Critical Success Factors**
- Maintain 80%+ architecture health score throughout migration
- Ensure quality gates continue passing during transition
- Keep import restriction rules updated to reflect new component organization
- Test architectural validation rules against new component structure before deployment

## Risk Mitigation
- **Rule Conflict Risk**: Test all ESLint rule changes locally before committing
- **CI/CD Failure Risk**: Plan for temporary quality gate adjustments if needed
- **Health Score Drop Risk**: Pre-validate shared component candidates against usage analytics
- **Import Break Risk**: Use gradual migration approach with temporary rule exceptions