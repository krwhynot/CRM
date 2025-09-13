# Layout Architecture Comparison and Analysis

The CRM currently uses a template-based layout system with specialized entity templates, while the recommended approach suggests a more flexible slot-based layout system. The current approach provides consistency through inheritance and specialization, while the slot-based approach offers greater flexibility and composability. Both architectures have merits, but the slot-based approach enables faster development of new features with less code duplication.

## Relevant Files

### Current Template-Based Architecture
- `/src/components/templates/EntityManagementTemplate.tsx`: Base template with entity-specific variants
- `/src/layout/components/LayoutWithFilters.tsx`: Layout wrapper with filter sidebar support
- `/src/components/ui/new/PageHeader.tsx`: Header component with limited slot support
- `/src/pages/Organizations.tsx`: Example page using EntityManagementTemplate
- `/src/pages/OrganizationsWithFilters.tsx`: Alternative approach using LayoutWithFilters

### Supporting Components
- `/src/components/filters/FilterSidebar.tsx`: Resizable filter sidebar with mobile sheet
- `/src/components/layout/PageContainer.tsx`: Container with semantic spacing tokens
- `/src/layout/components/Header.tsx`: Global header with search and user controls
- `/src/layout/components/AppSidebar.tsx`: Navigation sidebar using shadcn/ui
- `/src/components/ui/sidebar.tsx`: shadcn/ui sidebar primitives

## Relevant Tables
- N/A (Layout architecture comparison does not directly involve database tables)

## Relevant Patterns

**Template Inheritance Pattern**: Entity-specific templates (OrganizationManagementTemplate) inherit from base EntityManagementTemplate, providing specialized variants with pre-configured copy and behavior - example: `/src/components/templates/EntityManagementTemplate.tsx:135-161`

**Filter Section Composition**: FilterSection interface defines structured filter content with icons, badges, and collapsible sections - used in `/src/pages/Organizations.tsx:56-120`

**Design Token Integration**: 88% coverage through semantic tokens for spacing, typography, and colors - centralized in `/src/styles/tokens/`

**Dual Layout Approaches**: Two competing patterns exist - template-based (EntityManagementTemplate) and layout-based (LayoutWithFilters), creating inconsistency

**Action Composition Limitation**: PageHeader accepts actions as array or ReactNode but lacks true slot-based composition - see `/src/components/ui/new/PageHeader.tsx:87-134`

## Relevant Docs

**.docs/plans/layout-refactoring/current-page-patterns.docs.md**: You _must_ read this when working on page structure refactoring, understanding existing patterns, or migrating to slot-based layouts.

**.docs/plans/layout-refactoring/ui-components-and-tokens.docs.md**: You _must_ read this when working on layout UI components, design token integration, or responsive patterns.

**CLAUDE.md**: You _must_ read this when understanding project architecture, development patterns, and quality standards.

## Analysis

### Current Template-Based Approach

The CRM currently uses **EntityManagementTemplate** as its primary layout pattern, which:
- Provides entity-specific templates through inheritance (OrganizationManagementTemplate, ContactManagementTemplate, etc.)
- Automatically derives titles, subtitles, and button labels from COPY constants
- Limits customization to specific props (title, subtitle, headerActions, addButtonLabel)
- Wraps content in PageContainer with consistent spacing
- Renders actions through a custom renderActions function that manually composes buttons

The alternative **LayoutWithFilters** approach:
- Provides a wrapper with dual-sidebar layout (app navigation + filters)
- Manages filter state through FilterSidebar component
- Separates layout concerns from page content
- Offers mobile-responsive filter implementation via sheets

### Recommended Slot-Based Approach

The recommended approach suggests using **composable slots** where:
- PageLayout accepts props for title, filters, actions, and children
- Each slot accepts any React component without restrictions
- New elements are added by composing within slots
- No need to modify base layout logic
- True plug-and-play design

### Key Architectural Differences

**1. Component Composition**
- **Current**: Template inheritance with limited customization props
- **Recommended**: Full slot-based composition with unrestricted component injection

**2. Action Extensibility**
- **Current**: headerActions prop with manual button composition in renderActions
- **Recommended**: Direct JSX composition in actions slot

**3. Filter Integration**
- **Current**: Separate LayoutWithFilters wrapper or embedded filter sections
- **Recommended**: Filters as a slot in the main PageLayout

**4. Layout Flexibility**
- **Current**: Fixed template structure with predefined regions
- **Recommended**: Flexible slot arrangement with customizable regions

## Comparison

### Structural Differences

**Current Template-Based Structure**:
```typescript
<EntityManagementTemplate
  entityType="ORGANIZATION"
  entityCount={100}
  onAddClick={handleAdd}
  headerActions={<CustomButton />}  // Limited customization
>
  <DataDisplay />
  <Dialogs />
</EntityManagementTemplate>
```

**Recommended Slot-Based Structure**:
```typescript
<PageLayout
  title="Organizations"
  filters={<OrganizationFilters />}  // Full component
  actions={                           // Direct composition
    <div className="flex gap-2">
      <AddButton />
      <SyncButton />
      <ExportButton />
    </div>
  }
>
  <OrganizationTable />
</PageLayout>
```

### Development Workflow Differences

**Adding New Elements - Current Approach**:
1. Check if EntityManagementTemplate supports the customization
2. If not, either modify the template or create a new variant
3. For complex headers, abandon template and use custom implementation
4. Filter integration requires choosing between embedded or LayoutWithFilters
5. Risk of breaking other pages using the same template

**Adding New Elements - Recommended Approach**:
1. Simply add the new component to the appropriate slot
2. No template modification needed
3. No impact on other pages
4. Consistent filter integration through filter slot
5. True isolation of changes

### Maintainability Differences

**Current Approach Challenges**:
- Template modifications affect all pages using that template
- Multiple layout patterns (template vs LayoutWithFilters) create confusion
- Filter implementation duplicated across pages
- Hard to test individual components in isolation
- Type safety limited by ReactNode props

**Recommended Approach Benefits**:
- Each page owns its composition entirely
- Single consistent pattern for all pages
- Reusable slot components without coupling
- Easy to test components in isolation
- Better type safety with explicit component props

### Flexibility Differences

**Current Approach Limitations**:
- Fixed header structure with limited customization points
- Actions must conform to renderActions logic
- Difficult to add conditional regions
- Mobile responsiveness handled differently per approach
- Cannot easily rearrange layout regions

**Recommended Approach Advantages**:
- Any component can be placed in any slot
- Direct control over action composition
- Easy conditional rendering within slots
- Consistent responsive handling across all slots
- Layout regions can be rearranged per page

### Speed and Safety Advantages of Slot-Based Approach

**Speed Benefits**:
1. **No Template Analysis**: Developers don't need to understand template internals
2. **Direct Composition**: Add components directly without wrapper logic
3. **Copy-Paste Friendly**: Easy to duplicate and modify page structures
4. **Rapid Prototyping**: Quickly try different layouts without framework fights
5. **Parallel Development**: Teams can work on different slots simultaneously

**Safety Benefits**:
1. **Isolation**: Changes to one page don't affect others
2. **Predictable**: What you compose is what you get
3. **Type Safety**: Direct component usage improves TypeScript inference
4. **Testing**: Easier to test individual slot components
5. **Refactoring**: Safer to refactor when components are decoupled

**Ease Benefits**:
1. **Mental Model**: Simpler conceptual model (slots vs inheritance)
2. **Documentation**: Self-documenting through component composition
3. **Onboarding**: New developers understand slots immediately
4. **Debugging**: Clear component hierarchy in React DevTools
5. **Flexibility**: No framework constraints on what can be added

### Migration Path

The current architecture has good foundations that can evolve toward slot-based:
1. PageHeader already supports actions as ReactNode (partial slot support)
2. FilterSidebar is already a composable component
3. Design token system (88% coverage) provides consistent styling
4. shadcn/ui components are inherently composable

The main changes needed:
1. Create a unified PageLayout component with true slots
2. Deprecate entity-specific template variants
3. Standardize on slot-based composition pattern
4. Remove duplicate filter implementations
5. Document slot-based patterns for consistency