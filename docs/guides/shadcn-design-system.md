# KitchenPantry CRM Design System

**Owner:** KitchenPantry CRM Team · **Last updated:** 2025-08-28  
**Scope:** Design principles, patterns, and processes for food service CRM interfaces

---

## Quick Reference: Design Under Pressure

✅ **Critical Rules for Field Sales Context**
- **48px minimum** touch targets (restaurant kitchens, gloved hands)
- **Green = Go, Red = Stop** (universal cognitive shortcuts)
- **Single-column forms** on mobile (reduce cognitive load)
- **Progress indicators** for multi-step processes (maintain motivation)
- **Offline-capable** core features (poor network conditions)
- **High contrast** ratios 4.5:1+ (varied lighting conditions)

🎯 **Decision Framework**
1. Will this work on an iPad in a restaurant kitchen?
2. Does this reduce cognitive load under pressure?
3. Is this behavior predictable and learnable?
4. Does this strengthen business relationships?

---

# Part I: Principles

## Design Philosophy

We design for the unique demands of food service: **relationships drive revenue**, **decisions happen under pressure**, and **mobile-first isn't optional—it's survival**.

### Core Principles

**Efficiency Under Pressure** → Large targets, high contrast, progressive disclosure
**Trust Through Consistency** → Predictable patterns, reliable feedback
**Mobile-First Reality** → Touch-first, readable in poor lighting, thumb-friendly
**Industry Authenticity** → Food service terminology, authentic workflows
**Relationship-Centric** → People-first information architecture

### Users & Context

| User Type | Environment | Pain Points | Design Implications |
|-----------|-------------|-------------|-------------------|
| **Field Sales Teams** | Restaurant kitchens, distributor warehouses | Time pressure, poor lighting, one-handed use | Large touch targets, high contrast, voice-to-text |
| **Sales Managers** | Office + travel | 200+ relationships, coaching pressure | Dashboard-first, quick access, relationship context |
| **Operations Teams** | Office, multiple monitors | Bulk operations, data quality | Advanced filtering, keyboard shortcuts, error prevention |
| **System Admins** | IT environment | Security, compliance, user support | Granular controls, audit logging, admin dashboards |

### Behavioral Psychology Insights

**Cognitive Load Theory** → Progressive disclosure, chunking, recognition over recall
**Decision-Making Under Pressure** → Clear hierarchy, confirmation patterns, status visibility
**Habit Formation** → Location consistency, interaction consistency, feedback consistency
**Error Prevention** → Constraint-based design, confirmation thresholds, draft preservation

---

# Part II: Patterns

## Visual Language

### Brand Personality: "Trusted Partner in Food Service"
Professional yet approachable, reliable, efficient, industry-authentic

### Color Psychology

| Color | Hex | Psychology | Usage |
|-------|-----|------------|-------|
| **MFB Green** | #7CB342 | Growth, freshness, "go" action | Primary buttons, success states |
| **Clay Orange** | #EA580C | Warmth, energy, urgency | Secondary actions, warnings |
| **Sage Green** | #F0FDF4 | Natural, calming, trustworthy | Backgrounds, hover states |
| **Olive Dark** | #1F2937 | Sophisticated, authoritative | Headings, primary text |
| **Cream** | #FEFEF9 | Clean, premium, spacious | Background surfaces |

### Typography System

```css
/* Authority with Approachability */
h1: 32px, weight 700, Nunito, MFB Olive
h3: 18px, weight 600, Nunito, MFB Olive

/* Clarity and Efficiency */
Body: 15px, weight 400, line-height 1.5, Nunito
Table Headers: 15px, weight 600, MFB Olive
```

**Font Choice Rationale:** Nunito provides readability in poor lighting, professional warmth, and performance optimization.

## Component System (Atomic Design)

### Atoms

#### Button Decision Tree
```
Need user action?
├─ Primary action → Green default (Create, Save, Submit)
├─ Alternative action → Outline (Export, Settings)  
├─ Destructive action → Red destructive (Delete, Remove)
├─ Low-priority action → Ghost (Cancel, Back)
└─ Navigation → Link variant (Cross-references)
```

#### Button Specifications
```typescript
// Standard sizes for food service context
sizes: {
  default: "h-12 px-4 py-2 text-base", // 48px touch target
  sm: "h-11 px-3 text-sm",           // 44px minimum
  lg: "h-14 px-8 text-lg",           // Large actions
  icon: "h-12 w-12"                   // Square touch targets
}
```

#### Input Field Standards
- Single-column layout on mobile
- Required field indicators (no asterisks, use "Required" label)
- Smart defaults and constraints prevent errors
- Clear validation messages with solutions

### Molecules

#### Form Patterns
- **Single-step forms:** Vertical layout, logical grouping
- **Multi-step forms:** Progress indicator, previous/next navigation
- **Bulk operations:** Checkbox selection, batch action confirmation

#### Data Table Components
- **Zebra striping** for scanning accuracy
- **Bulk selection** patterns
- **Responsive design** maintains data accessibility
- **Sort/filter** reduce information overwhelm

### Organisms

#### Dashboard Cards
```typescript
// Metrics card pattern
<Card>
  <CardHeader>
    <Icon + Title + Trend Indicator>
  </CardHeader>
  <CardContent>
    <Large Number + Context + Change Percentage>
  </CardContent>
</Card>
```

#### Navigation Patterns
- **Sidebar:** Collapsible, role-based visibility
- **Breadcrumbs:** Hierarchical navigation
- **Command Palette:** Global search and actions

## UX Writing Standards

### Voice & Tone
**Voice (Consistent):** Professional, knowledgeable, supportive, industry-fluent
**Tone (Context-Adaptive):** 
- Dashboard → Confident, data-driven
- Forms → Helpful, clear, instructive
- Errors → Solution-focused, empowering

### Industry Terminology
✅ **Use:** Distributor, Principal, Drop size, Case quantities, Food Service Operator
❌ **Avoid:** Vendor, Partner, Customer (except relationship contexts)

### Content Patterns
**Button Labels:** Verb + noun ("Create Organization")
**Error Messages:** Problem + solution ("Organization name must be at least 2 characters")
**Success Messages:** Achievement + next action ("Organization created. Add your first contact?")

---

# Part III: Processes

## Component Inventory

| Component | Status | Variants | CRM Usage |
|-----------|---------|----------|-----------|
| Button | ✅ | default/destructive/ghost/outline/link | Primary actions, bulk operations |
| Input | ✅ | default/error + validation styling | Form data entry |
| Card | ✅ | default | Dashboard metrics, entity details |
| Table | ✅ | sortable/filterable/bulk-select | Data management |
| Dialog | ✅ | modal/sheet | Form wizards, confirmations |
| Badge | ✅ | status variants | Priority, status indicators |

**Legend:** ✅ Production ready · ⏳ In development · 🚧 Planned

## Design Governance

### Decision-Making Framework
1. **Problem Identification** → Multiple teams need same pattern
2. **Research Validation** → User testing confirms solution
3. **Technical Feasibility** → Performance and accessibility review
4. **Implementation** → Component development and documentation

### Change Approval Matrix
| Change Type | Approver | Timeline |
|-------------|----------|----------|
| Token updates | Design + Technical Lead | 2 weeks |
| New variants | Design Lead | 1 week |
| New components | Full team | 4 weeks |
| Breaking changes | Team + stakeholders | 8 weeks |

### Quality Gates
- **TypeScript compilation** (strict mode, zero errors)
- **Accessibility validation** (axe-core + manual testing)
- **Performance check** (bundle size, rendering time)
- **Cross-browser testing** (Chrome, Safari, Firefox)

## Development Integration

### Quality Commands
```bash
npm run validate      # Type-check + lint + build
npm run quality-gates # 6-stage validation pipeline
npm run dev:health    # Component architecture health
```

### Testing Strategy
- **MCP Tests:** auth, CRUD, dashboard, mobile workflows
- **Vitest:** Backend operations with 95%+ coverage
- **Architecture Tests:** State boundaries, component placement

---

# Appendices

## A. Technical Reference

### Design Tokens (CSS Variables)
```css
:root {
  --primary: 95 71% 56%;        /* MFB Green */
  --destructive: 20 100% 50%;   /* Error red */
  --radius: 0.375rem;           /* Border radius */
  /* Full token dictionary at /src/index.css */
}
```

### Component APIs
→ See `/src/components/ui/` for complete TypeScript interfaces

## B. Performance Standards

| Metric | Target | Current |
|--------|---------|---------|
| LCP | <2.5s | ✅ 2.1s |
| Bundle Size | <200KB | ✅ 185KB |
| Accessibility | WCAG 2.2 AA | ✅ 98% |

## C. Migration Guides

### shadcn/ui Component Updates
```bash
npx shadcn@latest add [component] --overwrite
```

### Breaking Change Process
8-week timeline: Announcement → Documentation → Coexistence → Migration → Removal

---

## Quick Links

**🔗 Live Production:** https://crm.kjrcloud.com  
**📁 Component Library:** `/src/components/ui/`  
**🎨 Figma Library:** [Link to Figma workspace]  
**📊 Analytics:** [Component usage dashboard]  
**🆘 Support:** GitHub issues or design system office hours  

---

*"Great design empowers people to do their best work."*  
**— KitchenPantry CRM Design System Team**