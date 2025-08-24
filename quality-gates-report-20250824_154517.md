# CRM Quality Gates Report - Sun Aug 24 15:45:17 CDT 2025

## ❌ TypeScript Compilation
Status: FAILED
```

> kitchenpantry-crm@1.0.0 type-check
> tsc --noEmit

src/__tests__/state-management-integration.test.tsx(42,9): error TS6133: 'createWrapper' is declared but its value is never read.
src/contexts/__tests__/AuthContext.security.test.tsx(9,22): error TS6133: 'waitFor' is declared but its value is never read.
src/contexts/__tests__/AuthContext.security.test.tsx(101,7): error TS2739: Type '{ message: string; name: string; status: number; }' is missing the following properties from type 'AuthError': code, __isAuthError
src/features/dashboard/components/activity/index.ts(2,10): error TS2724: '"./ActivityConfig"' has no exported member named 'ActivityConfig'. Did you mean 'ACTIVITY_CONFIG'?
src/features/dashboard/components/activity/index.ts(4,10): error TS2459: Module '"./ActivityFilters"' declares 'ActivityFilters' locally, but it is not exported.
src/features/dashboard/hooks/useDashboardMetrics.ts(370,50): error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
src/features/dashboard/hooks/useDashboardMetrics.ts(476,50): error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
src/features/interactions/hooks/useInteractionActions.ts(38,51): error TS2345: Argument of type 'Omit<{ attachments?: string[] | null | undefined; contact_id?: string | null | undefined; created_at?: string | null | undefined; created_by: string; deleted_at?: string | null | undefined; ... 13 more ...; updated_by?: string | ... 1 more ... | undefined; }, "created_by" | "updated_by">' is not assignable to parameter of type '{ attachments?: string[] | null | undefined; contact_id?: string | null | undefined; created_at?: string | null | undefined; created_by: string; deleted_at?: string | null | undefined; ... 13 more ...; updated_by?: string | ... 1 more ... | undefined; }'.
  Property 'created_by' is missing in type 'Omit<{ attachments?: string[] | null | undefined; contact_id?: string | null | undefined; created_at?: string | null | undefined; created_by: string; deleted_at?: string | null | undefined; ... 13 more ...; updated_by?: string | ... 1 more ... | undefined; }, "created_by" | "updated_by">' but required in type '{ attachments?: string[] | null | undefined; contact_id?: string | null | undefined; created_at?: string | null | undefined; created_by: string; deleted_at?: string | null | undefined; ... 13 more ...; updated_by?: string | ... 1 more ... | undefined; }'.
src/features/opportunities/hooks/useOpportunityNaming.ts(153,36): error TS2339: Property 'find' does not exist on type '{ id: string; name: string; type: "customer" | "principal" | "distributor" | "prospect" | "vendor"; } | { id: string; name: string; type: "customer" | "principal" | "distributor" | "prospect" | "vendor"; }[]'.
  Property 'find' does not exist on type '{ id: string; name: string; type: "customer" | "principal" | "distributor" | "prospect" | "vendor"; }'.
src/features/organizations/components/OrganizationsTable.tsx(26,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; segment: string; phone: string; primary_manager_name: string; address_line_1: string; city: string; state_province: string; website: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_2, annual_revenue, country, created_by, and 16 more.
src/features/organizations/components/OrganizationsTable.tsx(41,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; segment: string; phone: string; primary_manager_name: string; secondary_manager_name: string; address_line_1: string; city: string; state_province: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_2, annual_revenue, country, created_by, and 16 more.
src/features/organizations/components/OrganizationsTable.tsx(56,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; segment: string; phone: string; primary_manager_name: string; address_line_1: string; city: string; state_province: string; website: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_2, annual_revenue, country, created_by, and 16 more.
src/features/organizations/components/__tests__/OrganizationActions.test.tsx(6,7): error TS2740: Type '{ id: string; name: string; type: any; priority: string; phone: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_1, address_line_2, annual_revenue, city, and 22 more.
src/features/organizations/components/__tests__/OrganizationActions.test.tsx(57,9): error TS2322: Type '{ phone: undefined; address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; ... 25 more ...; website: string | null; }' is not assignable to type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }'.
  Types of property 'phone' are incompatible.
    Type 'undefined' is not assignable to type 'string | null'.
src/features/organizations/components/__tests__/OrganizationsTable.test.tsx(60,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; phone: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_1, address_line_2, annual_revenue, city, and 22 more.
src/features/organizations/components/__tests__/OrganizationsTable.test.tsx(69,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; phone: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_1, address_line_2, annual_revenue, city, and 22 more.
src/features/organizations/hooks/__tests__/useOrganizationsFiltering.test.ts(6,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; segment: string; phone: string; primary_manager_name: string; city: string; state_province: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_1, address_line_2, annual_revenue, country, and 18 more.
src/features/organizations/hooks/__tests__/useOrganizationsFiltering.test.ts(19,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; segment: string; phone: string; primary_manager_name: string; city: string; state_province: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_1, address_line_2, annual_revenue, country, and 18 more.
src/features/organizations/hooks/__tests__/useOrganizationsFiltering.test.ts(32,3): error TS2740: Type '{ id: string; name: string; type: any; priority: string; segment: string; phone: string; primary_manager_name: string; city: string; state_province: string; created_at: string; updated_at: string; }' is missing the following properties from type '{ address_line_1: string | null; address_line_2: string | null; annual_revenue: number | null; city: string | null; country: string | null; created_at: string | null; created_by: string; ... 25 more ...; website: string | null; }': address_line_1, address_line_2, annual_revenue, country, and 18 more.
src/features/products/components/product-row/ProductRowMain.tsx(63,30): error TS2339: Property 'in_stock' does not exist on type 'ProductWithPrincipal'.
src/features/products/components/product-row/ProductRowMain.tsx(64,31): error TS2339: Property 'low_stock' does not exist on type 'ProductWithPrincipal'.
src/features/products/components/product-row/ProductRowMain.tsx(75,20): error TS2339: Property 'principal_name' does not exist on type 'ProductWithPrincipal'.
src/features/products/components/product-row/ProductRowMain.tsx(80,20): error TS2339: Property 'brand' does not exist on type 'ProductWithPrincipal'.
src/features/products/components/product-row/sections/ProductSpecsSection.tsx(23,20): error TS2339: Property 'package_size' does not exist on type 'ProductWithPrincipal'.
src/features/products/components/product-row/sections/ProductSpecsSection.tsx(45,20): error TS2339: Property 'origin_country' does not exist on type 'ProductWithPrincipal'.
src/hooks/index.ts(15,10): error TS2724: '"./use-mobile"' has no exported member named 'useMobile'. Did you mean 'useIsMobile'?
src/hooks/useCoreFormSetup.ts(35,5): error TS2353: Object literal may only specify known properties, and 'showAdvancedOptions' does not exist in type 'UseFormLayoutProps<T>'.
src/lib/query-optimizations.ts(16,9): error TS2353: Object literal may only specify known properties, and 'cacheTime' does not exist in type 'OmitKeyof<QueryObserverOptions<unknown, Error, unknown, unknown, readonly unknown[], never>, "suspense" | "queryKey", "strictly">'.
src/lib/query-optimizations.ts(67,10): error TS2304: Cannot find name 'useInfiniteQuery'.
src/lib/query-optimizations.ts(71,24): error TS7006: Parameter 'lastPage' implicitly has an 'any' type.
src/lib/query-optimizations.ts(71,34): error TS7006: Parameter 'allPages' implicitly has an 'any' type.
src/lib/query-optimizations.ts(85,41): error TS6133: 'T' is declared but its value is never read.
src/lib/query-optimizations.ts(93,9): error TS6133: 'queryClient' is declared but its value is never read.
src/lib/query-optimizations.ts(280,19): error TS2367: This comparison appears to be unintentional because the types 'MutationStatus' and '"loading"' have no overlap.
src/lib/query-optimizations.ts(288,24): error TS2554: Expected 1 arguments, but got 0.
src/lib/query-optimizations.ts(309,30): error TS6133: 'filters' is declared but its value is never read.
src/lib/query-optimizations.ts(310,35): error TS6133: 'filters' is declared but its value is never read.
src/lib/query-optimizations.ts(311,34): error TS6133: 'id' is declared but its value is never read.
src/stores/contactAdvocacyStore.ts(20,3): error TS6133: 'ClientStateStore' is declared but its value is never read.
src/types/index.ts(9,1): error TS2308: Module './database.types' has already exported a member named 'CompositeTypes'. Consider explicitly re-exporting to resolve the ambiguity.
src/types/index.ts(9,1): error TS2308: Module './database.types' has already exported a member named 'Constants'. Consider explicitly re-exporting to resolve the ambiguity.
src/types/index.ts(9,1): error TS2308: Module './database.types' has already exported a member named 'Enums'. Consider explicitly re-exporting to resolve the ambiguity.
src/types/index.ts(9,1): error TS2308: Module './database.types' has already exported a member named 'Json'. Consider explicitly re-exporting to resolve the ambiguity.
src/types/index.ts(9,1): error TS2308: Module './database.types' has already exported a member named 'Tables'. Consider explicitly re-exporting to resolve the ambiguity.
src/types/index.ts(9,1): error TS2308: Module './database.types' has already exported a member named 'TablesInsert'. Consider explicitly re-exporting to resolve the ambiguity.
src/types/index.ts(9,1): error TS2308: Module './database.types' has already exported a member named 'TablesUpdate'. Consider explicitly re-exporting to resolve the ambiguity.
src/types/index.ts(12,1): error TS2308: Module './entities' has already exported a member named 'ContactRole'. Consider explicitly re-exporting to resolve the ambiguity.
tests/architecture/component-placement.test.ts(7,29): error TS6133: 'stat' is declared but its value is never read.
tests/architecture/component-placement.test.ts(8,26): error TS6133: 'dirname' is declared but its value is never read.
tests/architecture/component-placement.test.ts(20,5): error TS2740: Type 'IGlob' is missing the following properties from type 'string[]': length, pop, push, concat, and 28 more.
tests/architecture/component-placement.test.ts(21,7): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
tests/architecture/component-placement.test.ts(26,5): error TS2740: Type 'IGlob' is missing the following properties from type 'string[]': length, pop, push, concat, and 28 more.
tests/architecture/component-placement.test.ts(27,7): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
tests/architecture/component-placement.test.ts(142,78): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
tests/architecture/component-placement.test.ts(145,25): error TS2488: Type 'IGlob' must have a '[Symbol.iterator]()' method that returns an iterator.
tests/architecture/component-placement.test.ts(165,74): error TS2339: Property 'length' does not exist on type 'IGlob'.
tests/architecture/component-placement.test.ts(265,58): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
tests/architecture/component-placement.test.ts(267,32): error TS2488: Type 'IGlob' must have a '[Symbol.iterator]()' method that returns an iterator.
tests/architecture/component-placement.test.ts(277,15): error TS6133: 'hasGoodGrouping' is declared but its value is never read.
tests/architecture/eslint-rules.test.ts(20,7): error TS2353: Object literal may only specify known properties, and 'useEslintrc' does not exist in type 'Options'.
tests/architecture/performance-patterns.test.ts(19,5): error TS2740: Type 'IGlob' is missing the following properties from type 'string[]': length, pop, push, concat, and 28 more.
tests/architecture/performance-patterns.test.ts(20,7): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
tests/architecture/performance-patterns.test.ts(24,5): error TS2740: Type 'IGlob' is missing the following properties from type 'string[]': length, pop, push, concat, and 28 more.
tests/architecture/performance-patterns.test.ts(24,69): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
tests/architecture/performance-patterns.test.ts(26,5): error TS2740: Type 'IGlob' is missing the following properties from type 'string[]': length, pop, push, concat, and 28 more.
tests/architecture/performance-patterns.test.ts(26,75): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
tests/architecture/state-boundaries.test.ts(7,29): error TS6133: 'stat' is declared but its value is never read.
tests/architecture/state-boundaries.test.ts(8,16): error TS6133: 'extname' is declared but its value is never read.
tests/backend/imports/excel-import-backend.test.ts(683,37): error TS6133: 'index' is declared but its value is never read.
tests/backend/performance/query-optimization.test.ts(336,17): error TS7006: Parameter 'result' implicitly has an 'any' type.
tests/backend/performance/query-optimization.test.ts(431,61): error TS7006: Parameter 'opp' implicitly has an 'any' type.
tests/backend/performance/query-optimization.test.ts(442,85): error TS2698: Spread types may only be created from object types.
tests/backend/performance/query-optimization.test.ts(494,19): error TS7006: Parameter 'result' implicitly has an 'any' type.
tests/backend/setup/test-setup.ts(10,10): error TS6133: 'vi' is declared but its value is never read.
tests/backend/setup/test-setup.ts(10,47): error TS6133: 'expect' is declared but its value is never read.
tests/backend/setup/test-setup.ts(227,13): error TS6133: 'data' is declared but its value is never read.
tests/backend/setup/test-setup.ts(276,7): error TS2502: 'testSupabase' is referenced directly or indirectly in its own type annotation.
tests/backend/setup/test-setup.ts(277,7): error TS2502: 'testConfig' is referenced directly or indirectly in its own type annotation.
tests/backend/setup/test-setup.ts(278,7): error TS2502: 'TestCleanup' is referenced directly or indirectly in its own type annotation.
tests/backend/setup/test-setup.ts(279,7): error TS2502: 'PerformanceMonitor' is referenced directly or indirectly in its own type annotation.
tests/backend/setup/test-setup.ts(280,7): error TS2502: 'TestAuth' is referenced directly or indirectly in its own type annotation.
tests/components/contacts/useContactsBadges.test.ts(2,35): error TS2307: Cannot find module '@/hooks/useContactsBadges' or its corresponding type declarations.
tests/shared/architecture-test-utils.ts(6,20): error TS6133: 'readdir' is declared but its value is never read.
tests/shared/architecture-test-utils.ts(6,29): error TS6133: 'stat' is declared but its value is never read.
tests/shared/architecture-test-utils.ts(7,35): error TS6133: 'dirname' is declared but its value is never read.
tests/shared/architecture-test-utils.ts(65,3): error TS2740: Type 'IGlob' is missing the following properties from type 'string[]': length, pop, push, concat, and 28 more.
tests/shared/architecture-test-utils.ts(66,5): error TS2353: Object literal may only specify known properties, and 'cwd' does not exist in type '(err: Error | null, matches: string[]) => void'.
```

