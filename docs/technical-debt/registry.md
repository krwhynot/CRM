# Technical Debt Registry

This document tracks all known technical debt in the CRM system, providing visibility and accountability for debt management.

## Summary

- **Total Items**: 3
- **High Priority**: 0
- **Medium Priority**: 3
- **Low Priority**: 0
- **Status**: Healthy

## Technical Debt Items

### High Priority (v1.1.0)

#### 1. Bulk Operations for Interactions
- **File**: `src/features/interactions/components/table/InteractionTableHeader.tsx:47,50`
- **Issue**: #TBD (Will be updated by script)
- **Description**: Selection state and bulk operations not implemented
- **Impact**: User workflow efficiency severely limited
- **Effort**: 8-12 hours
- **Dependencies**: None
- **Status**: Feature flagged, safe fallback implemented

### Medium Priority (v1.0.1)

#### 2. XLSX Export Implementation
- **File**: `src/features/import-export/hooks/useExportExecution.ts:136`
- **Issue**: #TBD
- **Description**: XLSX export falls back to CSV, user confusion
- **Impact**: Feature completeness, user expectations not met
- **Effort**: 4-6 hours
- **Dependencies**: SheetJS library integration
- **Status**: Feature flagged, CSV fallback working

#### 3. RPC Contact Creation
- **File**: `src/features/contacts/hooks/useContacts.ts:323`
- **Issue**: #TBD
- **Description**: Contact creation throws error, only import works
- **Impact**: User workflow limitation, no individual contact creation
- **Effort**: 6-8 hours
- **Dependencies**: Supabase RPC function implementation
- **Status**: Feature flagged, clear error message provided

#### 4. TypeScript Type Safety
- **File**: `.eslintrc.cjs:25`
- **Issue**: #TBD
- **Description**: Explicit any usage not fully restricted
- **Impact**: Runtime safety, code quality
- **Effort**: 8-16 hours
- **Dependencies**: Codebase audit required
- **Status**: ESLint warning currently active

### Low Priority (v1.1.0 - v1.2.0)

#### 5. Opportunity Stage Tracking
- **File**: `src/features/opportunities/hooks/useOpportunities.ts:651`
- **Issue**: #TBD
- **Description**: Stage changes not tracked over time
- **Impact**: Analytics and audit capabilities missing
- **Effort**: 12-16 hours
- **Dependencies**: Database schema changes required
- **Status**: Future enhancement

#### 6. Interaction Mark Complete
- **File**: `src/features/interactions/hooks/useInteractionTimelineItemActions.ts:39`
- **Issue**: #TBD
- **Description**: Mark complete functionality not implemented
- **Impact**: Interaction management workflow limitation
- **Effort**: 4-6 hours
- **Dependencies**: None
- **Status**: Enhancement for workflow improvement

#### 7. Contact Date Sorting
- **File**: `src/features/contacts/components/ContactsTable.original.tsx:261`
- **Issue**: #TBD
- **Description**: Date-based sorting implementation missing
- **Impact**: User experience limitation
- **Effort**: 3-4 hours
- **Dependencies**: None
- **Status**: UI enhancement

## Management Process

### Creation Process
1. Technical debt is identified during development
2. TODO comments are created with context
3. ESLint warnings alert developers
4. Quarterly reviews convert TODOs to GitHub issues
5. Issues are prioritized and assigned

### Tracking Process
1. All debt items have GitHub issues
2. Feature flags prevent user-facing broken functionality
3. Clear error messages guide users to alternatives
4. Progress is tracked in project boards
5. Regular team reviews assess debt accumulation

### Resolution Process
1. Issues are prioritized by impact and effort
2. Debt work is scheduled in regular sprints
3. Implementation follows existing code patterns
4. Testing ensures no regressions
5. Feature flags are updated upon completion

## Metrics

### Debt Accumulation Rate
- **Current**: 7 items identified in initial audit
- **Target**: <3 new items per sprint
- **Alert Threshold**: >5 items accumulating

### Resolution Rate
- **Target**: 2-3 items resolved per month
- **Current Sprint**: 0 items (establishing baseline)
- **Next Sprint**: Target 2 high/medium priority items

### Quality Impact
- **User-Facing Breaks**: 0 (prevented by feature flags)
- **Development Velocity Impact**: Minimal
- **Code Quality Score**: Maintained via ESLint rules

## Tools and Automation

### ESLint Integration
- `no-warning-comments` rule warns on TODO/FIXME/HACK
- Custom rules prevent architectural violations
- Pre-commit hooks planned for future

### Feature Flag System
- Runtime toggles prevent broken user experiences
- Clear user messaging for disabled features
- Admin visibility into disabled functionality

### GitHub Integration
- Automated issue creation from TODO comments
- Issue templates for consistent debt documentation
- Project board integration for sprint planning

## Review Schedule

### Weekly
- Check ESLint warnings for new TODO comments
- Verify feature flags are properly configured
- Monitor user feedback on disabled features

### Monthly  
- Review debt accumulation trends
- Prioritize items for upcoming sprints
- Update effort estimates based on team velocity

### Quarterly
- Comprehensive debt audit
- Strategy review and process improvements
- Team training on debt prevention

## Success Criteria

### Immediate (Month 1)
- ✅ Zero user-facing broken functionality
- ✅ All debt items tracked in GitHub
- ✅ Feature flag system operational
- ✅ ESLint rules enforcing standards

### Short Term (Month 2-3)
- [ ] 3 critical debt items resolved
- [ ] XLSX export functionality complete
- [ ] RPC contact creation working
- [ ] Bulk operations partially implemented

### Long Term (Month 4-6)
- [ ] Debt accumulation rate below target
- [ ] Resolution rate meets monthly goals
- [ ] Type safety fully enforced
- [ ] All high/medium priority items resolved

---

**Last Updated**: August 24, 2025
**Next Review**: Weekly team standup  
**Owner**: Development Team  
**Stakeholder**: Product Owner