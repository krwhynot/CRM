# Yup Validation Patterns Research

Analysis of complex Yup validation patterns in the CRM system revealing sophisticated conditional validation, transform functions, and integration challenges.

## Relevant Files
- `/src/types/validation.ts`: Central validation exports and product schema with principal mode patterns
- `/src/types/contact.types.ts`: Most complex conditional validations with organization mode switching
- `/src/types/opportunity.types.ts`: Multi-principal schema composition and stage progression logic
- `/src/types/interaction.types.ts`: Nested object validation with principal arrays and follow-up conditionals
- `/src/lib/form-transforms.ts`: Comprehensive transform function library for type conversion
- `/src/hooks/useCoreFormSetup.ts`: React Hook Form integration with yupResolver
- `/src/components/forms/CRMFormSchemas.tsx`: Parallel Zod implementation indicating migration direction

## Architectural Patterns

- **Conditional Validation**: Extensive use of `.when()` for mode-based field requirements (12+ instances)
- **Transform-Heavy Architecture**: FormTransforms utility with 15+ transform functions for type coercion
- **Schema Composition**: Complex schema inheritance with re-exports across entity type files
- **Type Inference**: Heavy reliance on `yup.InferType` for TypeScript integration (6+ form data types)
- **Dual Validation Libraries**: Active migration pattern with Yup (legacy) and Zod (new) coexisting

## Edge Cases & Gotchas

- **Principal Mode Complexity** in `/src/types/validation.ts:31-122`: Product creation schema with 6 conditional fields based on `principal_mode` ('existing' vs 'new'), requiring careful field requirement switching
- **Organization Mode Switching** in `/src/types/contact.types.ts:158-174`: Contact schema conditionally requires organization fields when `organization_mode: 'new'`, creating nested dependency validation
- **Transform Function Context** in `/src/lib/form-transforms.ts:134-144`: `conditionalTransform` factory uses `this.parent` context for field interdependence, making schema reusability complex
- **Multi-Schema Opportunity Creation** in `/src/types/opportunity.types.ts:148-250`: `multiPrincipalOpportunitySchema` vs `opportunitySchema` with different validation rules and legacy database value support
- **Follow-up Date Dependency** in `/src/types/interaction.types.ts:90-94`: Classic `.when()` pattern requiring follow-up date only when `follow_up_required: true`
- **Legacy Value Compatibility** in `/src/types/opportunity.types.ts:195-239`: Dual enum validation supporting both TypeScript-aligned values ('lead', 'qualified') and legacy database values ('New Lead', 'Initial Outreach')
- **Array Transform Complexity** in multiple schemas: `FormTransforms.optionalArray` vs `FormTransforms.nullableArray` with different empty-state handling

## Most Challenging Migration Patterns

1. **Context-Dependent Transforms**: The `conditionalTransform` factory in form-transforms.ts uses `this.parent` to access sibling field values, making schema context-aware
2. **Mode-Based Field Cascading**: Product and Contact schemas have cascading field requirements based on mode selection, requiring complex conditional logic
3. **Legacy Database Compatibility**: Opportunity schemas maintain backward compatibility with string-based enums while supporting new TypeScript-aligned values
4. **Transform Chain Dependencies**: Multiple transforms applied in sequence with interdependencies (nullable → uuid validation → array filtering)
5. **React Hook Form Integration**: Custom resolver casting with `as never` type assertions for TypeScript compatibility in useCoreFormSetup.ts
6. **Nested Object Validation**: Interaction schema with nested `principals` array containing object validation with optional fields

## Relevant Docs
- [React Hook Form Yup Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [Yup Conditional Validation Guide](https://github.com/jquense/yup#yuprefkey-options)
- [Yup Transform Documentation](https://github.com/jquense/yup#transforms)
- Internal transform patterns at `/src/lib/form-transforms.ts`