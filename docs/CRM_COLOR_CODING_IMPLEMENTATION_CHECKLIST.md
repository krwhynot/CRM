# CRM Color-Coding Implementation Checklist

**Version:** 2.0  
**Date:** January 2025  
**Project:** KitchenPantry CRM - Relationship-Centric Visual System  
**Scope:** Professional entity color-coding with clean, enterprise-appropriate aesthetics  
**Workflow:** Vertical Scaling with Specialized Agent Architecture

---

## 🎯 **Project Overview**

### **Objective**
Implement a professional relationship-centric visual system using strategic entity color coding to enhance user recognition and workflow efficiency while maintaining clean, enterprise-grade aesthetics using specialized sub-agents for each implementation stage.

### **Entity Color Strategy**
- 🔵 **Organizations**: Blue family (professional, institutional)
- 🟢 **Contacts**: Green family (people, relationships, growth)  
- 🟣 **Products**: Purple family (premium, distinctive)
- 🟠 **Opportunities**: Orange family (energy, action, sales)
- 🟡 **Interactions**: Yellow family (communication, activity)

### **Design Principles**
- **60% Neutral**: Gray-50/100 backgrounds, professional foundation
- **30% Entity Accents**: Strategic color usage for recognition
- **10% Semantic**: Success/warning/error system colors
- **Clean First**: Professional appearance over flashy interactions

### **Agent-Based Implementation Approach**
Following the Vertical Scaling Workflow pattern, each stage will be handled by specialized agents:
- **Stage 1**: Database Schema Architect - Foundation and configuration
- **Stage 2**: Coordinated UI Component Builder - Component system updates
- **Stage 3**: Multiple Entity Specialists - Entity-specific implementations
- **Stage 4**: Testing Quality Assurance - Validation and polish

**Timeline per Stage**: 2-3 days depending on complexity  
**Development Approach**: Single developer with agent assistance, phased implementation  
**Tech Stack**: React 18 + TypeScript + Vite + Supabase + shadcn/ui + Tailwind CSS

---

## 📋 **Implementation Stages (Agent-Driven)**

---

## **Stage 1: Foundation & Configuration Setup (Day 1-2)**
**Agent:** `database-schema-architect` & `coordinated-ui-component-builder`

### **Business Requirements Definition**
- [ ] **User Story**: As a Sales Manager, I want entity-specific color coding so I can instantly recognize organizations, contacts, products, opportunities, and interactions throughout the CRM interface.
- [ ] **Business Value**: Improves workflow efficiency by 25% through instant visual entity recognition and reduces cognitive load during data-heavy tasks.
- [ ] **Success Criteria**: 
  - Entity recognition speed < 2 seconds
  - Professional appearance maintained
  - No degradation in page load performance
- [ ] **Priority Level**: Important (Phase 2 enhancement feature)

### **Technical Requirements Assessment**
- [ ] **Database Changes**: None required (pure frontend enhancement)
- [ ] **API Changes**: None required (styling-only implementation)
- [ ] **UI Components**: Extensive updates to existing shadcn/ui components
- [ ] **Authentication**: No changes to user access or permissions
- **Complexity**: Medium (4-7 days) - Component modifications, design system updates

### **Agent Tasks: Database Schema Architect**
**Responsibility**: Configuration foundation and color token architecture

**Required Tool**: Use `mcp__shadcn-ui__list_components` and `mcp__shadcn-ui__get_component` to verify existing component structure before configuration

- [ ] **Research existing shadcn/ui components**
  ```bash
  # Use MCP tool to list all available components
  mcp__shadcn-ui__list_components
  
  # Get component details for components that will be modified
  mcp__shadcn-ui__get_component componentName="badge"
  mcp__shadcn-ui__get_component componentName="card" 
  mcp__shadcn-ui__get_component componentName="table"
  ```

- [ ] **Extend tailwind.config.js with entity color tokens**
  ```typescript
  // Add to tailwind.config.js colors section
  entity: {
    organizations: {
      bg: "rgb(239 246 255)",      // blue-50
      border: "rgb(191 219 254)",   // blue-200  
      text: "rgb(29 78 216)",       // blue-700
      subtle: "rgb(248 250 252)",   // blue-25 alternative
      medium: "rgb(147 197 253)",   // blue-300
      strong: "rgb(29 78 216)"      // blue-700
    },
    contacts: {
      bg: "rgb(236 253 245)",      // emerald-50
      border: "rgb(167 243 208)",   // emerald-200
      text: "rgb(5 150 105)",       // emerald-700
      subtle: "rgb(240 253 244)",   // emerald-25 alternative
      medium: "rgb(110 231 183)",   // emerald-300
      strong: "rgb(5 150 105)"      // emerald-700
    },
    products: {
      bg: "rgb(245 243 255)",      // violet-50
      border: "rgb(196 181 253)",   // violet-200
      text: "rgb(109 40 217)",      // violet-700
      subtle: "rgb(250 249 255)",   // violet-25 alternative  
      medium: "rgb(167 139 250)",   // violet-300
      strong: "rgb(109 40 217)"     // violet-700
    },
    opportunities: {
      bg: "rgb(255 247 237)",      // orange-50
      border: "rgb(254 215 170)",   // orange-200
      text: "rgb(194 65 12)",       // orange-700
      subtle: "rgb(255 251 246)",   // orange-25 alternative
      medium: "rgb(253 186 116)",   // orange-300
      strong: "rgb(194 65 12)"      // orange-700
    },
    interactions: {
      bg: "rgb(254 252 232)",      // amber-50
      border: "rgb(253 230 138)",   // amber-200
      text: "rgb(180 83 9)",        // amber-700
      subtle: "rgb(255 254 240)",   // amber-25 alternative
      medium: "rgb(252 211 77)",    // amber-300
      strong: "rgb(180 83 9)"       // amber-700
    }
  },
  form: {
    bg: "rgb(249 250 251)",        // gray-50
    sectionBg: "rgb(243 244 246)",  // gray-100
    label: "rgb(55 65 81)",         // gray-700
    border: "rgb(209 213 219)"      // gray-300
  }
  ```

**Agent Command**: `@database-schema-architect extend tailwind configuration with entity color tokens and CSS custom properties for professional CRM color system`

**Validation Checklist**:
- [ ] Color tokens compile without errors
- [ ] CSS custom properties support dark mode
- [ ] Professional color palette maintained
- [ ] Accessibility contrast ratios verified

---

## **Stage 2: Component System Implementation (Day 2-4)**
**Agent:** `coordinated-ui-component-builder`

### **Agent Tasks: Coordinated UI Component Builder**
**Responsibility**: Design system consistency and component architecture

**Required Tool**: Use `mcp__shadcn-ui__get_component` and `mcp__shadcn-ui__get_component_demo` for all UI component modifications

- [ ] **Research shadcn/ui component implementation patterns**
  ```bash
  # Get current component source code before modifications
  mcp__shadcn-ui__get_component componentName="badge"
  mcp__shadcn-ui__get_component componentName="card"
  mcp__shadcn-ui__get_component componentName="table"
  mcp__shadcn-ui__get_component componentName="form"
  
  # Get demo patterns for proper usage
  mcp__shadcn-ui__get_component_demo componentName="badge"
  mcp__shadcn-ui__get_component_demo componentName="card"
  mcp__shadcn-ui__get_component_demo componentName="table"
  ```

- [ ] **Update badge.tsx with entity variants**
  ```typescript
  // File: src/components/ui/badge.tsx
  // Add to badgeVariants variants object:
  
  "entity-organizations": "bg-entity-organizations-bg text-entity-organizations-text border border-entity-organizations-border font-medium",
  "entity-contacts": "bg-entity-contacts-bg text-entity-contacts-text border border-entity-contacts-border font-medium", 
  "entity-products": "bg-entity-products-bg text-entity-products-text border border-entity-products-border font-medium",
  "entity-opportunities": "bg-entity-opportunities-bg text-entity-opportunities-text border border-entity-opportunities-border font-medium",
  "entity-interactions": "bg-entity-interactions-bg text-entity-interactions-text border border-entity-interactions-border font-medium"
  ```

**Agent Command**: `@coordinated-ui-component-builder create entity-aware badge, form, and card components with professional visual hierarchy using shadcn/ui MCP tool for component research and implementation patterns`

**Component Updates Required** (All require shadcn/ui MCP tool usage):
- Badge component with entity variants (research current implementation first)
- Form components with section grouping (verify shadcn/ui form patterns)
- Card components with dashboard variants (get shadcn/ui card demo examples)
- Table components with enhanced scanability (study shadcn/ui table structure)
- Navigation components with entity recognition (research navigation patterns)

**Validation Checklist**:
- [ ] All components researched using `mcp__shadcn-ui__get_component` before modification
- [ ] Implementation patterns verified using `mcp__shadcn-ui__get_component_demo`
- [ ] All components compile without TypeScript errors
- [ ] Design system consistency maintained with shadcn/ui standards
- [ ] Professional appearance preserved
- [ ] Accessibility standards met (WCAG AA)
- [ ] Mobile responsiveness validated

---

## **Stage 3: Entity-Specific Implementation (Day 4-6)**
**Agent(s):** Multiple specialized agents per entity

### **Business Entity Implementation Strategy**
Each entity will be handled by its respective specialized agent following the established component patterns.

### **Agent Tasks: Organizations (Blue Theme)**
**Agent:** `database-schema-architect` (for organization-specific logic)
**Responsibility**: Blue-themed organization components

**Agent Command**: `@database-schema-architect implement blue-themed organization components with professional styling and critical field emphasis using shadcn/ui MCP tool for all UI modifications`

**Required shadcn/ui MCP Tool Usage**:
```bash
# Research components before organization-specific modifications
mcp__shadcn-ui__get_component componentName="badge"  # For priority/type badges
mcp__shadcn-ui__get_component componentName="form"   # For form field modifications
mcp__shadcn-ui__get_component componentName="card"   # For section grouping
mcp__shadcn-ui__get_component componentName="table"  # For enhanced table styling

# Get implementation examples
mcp__shadcn-ui__get_component_demo componentName="badge"
mcp__shadcn-ui__get_component_demo componentName="form"
```

**Tasks for Organization Components**:
- Research badge component structure before applying blue entity badges for Priority and Type fields
- Study form component patterns before implementing critical field highlighting for Account Priority
- Verify card component structure before adding form section grouping with subtle blue accents
- Analyze table component before updating styling with enhanced scanability
- Research card variants before integrating dashboard cards with blue accent borders

**Validation Checklist**:
- [ ] All UI modifications researched using shadcn/ui MCP tool first
- [ ] Component implementations follow shadcn/ui patterns
- [ ] Blue theme applied consistently across organization components
- [ ] Critical fields properly emphasized using shadcn/ui form patterns
- [ ] Professional appearance maintained with shadcn/ui standards
- [ ] Table scanability improved with better striping following shadcn/ui table structure

### **Agent Tasks: Contacts (Green Theme)**
**Agent:** `crm-auth-manager` (for contact relationship logic)
**Responsibility**: Green-themed contact components

**Agent Command**: `@crm-auth-manager implement green-themed contact components with relationship-focused styling and authority indicators using shadcn/ui MCP tool for all UI modifications`

**Required shadcn/ui MCP Tool Usage**:
```bash
# Research before contact component modifications
mcp__shadcn-ui__get_component componentName="badge"    # For authority badges
mcp__shadcn-ui__get_component componentName="avatar"   # For contact avatars
mcp__shadcn-ui__get_component componentName="form"     # For relationship forms
mcp__shadcn-ui__get_component_demo componentName="badge"
```

### **Agent Tasks: Products (Purple Theme)**  
**Agent:** `analytics-reporting-engine` (for product categorization)
**Responsibility**: Purple-themed product components

**Agent Command**: `@analytics-reporting-engine implement purple-themed product components with category emphasis and principal relationship indicators using shadcn/ui MCP tool for all UI modifications`

**Required shadcn/ui MCP Tool Usage**:
```bash
# Research before product component modifications
mcp__shadcn-ui__get_component componentName="badge"    # For category badges
mcp__shadcn-ui__get_component componentName="select"   # For category selection
mcp__shadcn-ui__get_component componentName="table"    # For product tables
mcp__shadcn-ui__get_component_demo componentName="select"
```

### **Agent Tasks: Opportunities (Orange Theme)**
**Agent:** `coordinated-ui-component-builder` (for pipeline visualization)  
**Responsibility**: Orange-themed opportunity components

**Agent Command**: `@coordinated-ui-component-builder implement orange-themed opportunity components with pipeline progression indicators and stage visualization using shadcn/ui MCP tool for all UI modifications`

**Required shadcn/ui MCP Tool Usage**:
```bash
# Research before opportunity component modifications
mcp__shadcn-ui__get_component componentName="progress"   # For pipeline progress
mcp__shadcn-ui__get_component componentName="badge"      # For stage badges
mcp__shadcn-ui__get_component componentName="card"       # For opportunity cards
mcp__shadcn-ui__get_component_demo componentName="progress"
```

### **Agent Tasks: Interactions (Yellow Theme)**
**Agent:** `activity-feed-builder` (for interaction timeline)
**Responsibility**: Yellow-themed interaction components

**Agent Command**: `@activity-feed-builder implement yellow-themed interaction components with timeline context and communication type indicators using shadcn/ui MCP tool for all UI modifications`

**Required shadcn/ui MCP Tool Usage**:
```bash
# Research before interaction component modifications
mcp__shadcn-ui__get_component componentName="badge"      # For interaction type badges
mcp__shadcn-ui__get_component componentName="card"       # For activity cards
mcp__shadcn-ui__get_component componentName="separator"  # For timeline separation
mcp__shadcn-ui__get_component_demo componentName="card"
```

---

## **Stage 4: Testing & Quality Assurance (Day 6-7)**
**Agent:** `testing-quality-assurance`

### **Agent Tasks: Testing Quality Assurance**
**Responsibility**: Comprehensive testing strategy implementation

**Agent Command**: `@testing-quality-assurance implement comprehensive testing strategy for CRM color-coding system including accessibility, performance, and user acceptance testing with shadcn/ui MCP tool verification of component compliance`

**Required shadcn/ui MCP Tool Usage for Testing**:
```bash
# Verify all modified components still follow shadcn/ui standards
mcp__shadcn-ui__get_component componentName="badge"
mcp__shadcn-ui__get_component componentName="card" 
mcp__shadcn-ui__get_component componentName="table"
mcp__shadcn-ui__get_component componentName="form"
mcp__shadcn-ui__get_component componentName="progress"
mcp__shadcn-ui__get_component componentName="avatar"
mcp__shadcn-ui__get_component componentName="select"
mcp__shadcn-ui__get_component componentName="separator"

# Get component metadata for testing validation
mcp__shadcn-ui__get_component_metadata componentName="badge"
mcp__shadcn-ui__get_component_metadata componentName="form"
```

### **Testing Implementation Strategy**

**Manual Testing Checklist**:
- [ ] **Color System Validation**
  - [ ] Entity colors display correctly across all components
  - [ ] Professional appearance maintained
  - [ ] Critical fields properly emphasized
  - [ ] Table scanability improved

**Automated Testing Setup**:
- [ ] **Component Testing**
  - [ ] Badge variants render with correct entity colors
  - [ ] Form components display proper visual hierarchy
  - [ ] Table components show enhanced striping
  - [ ] Navigation shows correct active states

**Accessibility Testing**:
- [ ] **WCAG AA Compliance**
  - [ ] Contrast ratios meet 4.5:1 minimum for all text
  - [ ] Focus indicators visible and properly styled
  - [ ] Color information has non-color alternatives
  - [ ] Screen reader compatibility validated

**Performance Testing**:
- [ ] **Load Performance**
  - [ ] Page load times < 3 seconds with new styling
  - [ ] Color calculations don't impact render performance
  - [ ] Bundle size increase < 5%
  - [ ] Memory usage remains stable

**Cross-Platform Testing**:
- [ ] **Browser Compatibility**
  - [ ] Chrome, Firefox, Safari, Edge (latest 2 versions)
  - [ ] Mobile browsers (iOS Safari, Chrome Mobile)
  - [ ] Responsive design on tablet/mobile

**User Acceptance Testing**:
- [ ] **Sales Manager Workflow Validation**
  - [ ] Entity recognition speed < 2 seconds
  - [ ] Workflow efficiency improvement measured
  - [ ] Professional appearance confirmed
  - [ ] Cognitive load reduction validated

**Validation Checklist**:
- [ ] All modified components verified against shadcn/ui standards using MCP tool
- [ ] Component metadata confirms proper shadcn/ui compliance
- [ ] All tests passing without errors
- [ ] Professional appearance maintained across all components
- [ ] Entity recognition speed targets achieved
- [ ] Accessibility compliance verified
- [ ] All UI modifications follow shadcn/ui design patterns

## **Stage 5: Deployment & Documentation (Day 7-8)**
**Agent:** `crm-deployment-orchestrator` & `documentation-knowledge-manager`

### **Agent Tasks: CRM Deployment Orchestrator**
**Responsibility**: Production deployment and monitoring setup

**Agent Command**: `@crm-deployment-orchestrator implement staged deployment of color-coding system with performance monitoring and rollback capabilities`

**Deployment Strategy**:
- [ ] **Pre-Deployment Validation**
  - [ ] All agent-implemented components tested
  - [ ] Performance benchmarks verified
  - [ ] Accessibility compliance confirmed
  - [ ] Code review completed

- [ ] **Staged Rollout Process**
  - [ ] Feature flag configuration for gradual rollout
  - [ ] Staging environment validation complete
  - [ ] Production deployment executed
  - [ ] Real-time monitoring active

### **Agent Tasks: Documentation Knowledge Manager**  
**Responsibility**: Comprehensive documentation and knowledge transfer

**Agent Command**: `@documentation-knowledge-manager create comprehensive documentation for color-coding system including technical guides, user manuals, and training materials with shadcn/ui MCP tool reference for component documentation`

**Required shadcn/ui MCP Tool Usage for Documentation**:
```bash
# Document all shadcn/ui components used in the implementation
mcp__shadcn-ui__list_components  # Get complete list for documentation
mcp__shadcn-ui__get_component_metadata componentName="badge"
mcp__shadcn-ui__get_component_metadata componentName="card"
mcp__shadcn-ui__get_component_metadata componentName="table"
mcp__shadcn-ui__get_component_metadata componentName="form"

# Get current implementation patterns for documentation
mcp__shadcn-ui__get_component_demo componentName="badge"
mcp__shadcn-ui__get_component_demo componentName="form"
```

**Documentation Deliverables**:
- [ ] **Technical Documentation**
  - [ ] Agent-specific implementation guides with shadcn/ui MCP tool usage patterns
  - [ ] Component documentation with entity color usage and shadcn/ui compliance verification
  - [ ] Tailwind configuration reference with shadcn/ui integration notes
  - [ ] Design system updates including shadcn/ui component modifications
  - [ ] shadcn/ui MCP tool usage guide for future component modifications

- [ ] **User Documentation**
  - [ ] Sales Manager guide to entity color coding
  - [ ] Visual reference cards for entity recognition
  - [ ] Accessibility feature documentation
  - [ ] Training material updates
  - [ ] shadcn/ui component usage guidelines for developers

---

## **📊 Success Criteria & Agent Validation**

### **Agent Performance Metrics**
- [ ] **Database Schema Architect**: Configuration foundation implemented without errors
- [ ] **Coordinated UI Component Builder**: Component system consistency achieved
- [ ] **Entity-Specific Agents**: All entity themes properly implemented
- [ ] **Testing Quality Assurance**: All validation criteria met
- [ ] **Deployment Orchestrator**: Successful production deployment
- [ ] **Documentation Manager**: Complete knowledge transfer achieved

### **Business Success Criteria**
- [ ] **Entity Recognition Speed**: < 2 seconds (verified by testing agent)
- [ ] **Professional Appearance**: Enterprise-grade aesthetic maintained
- [ ] **Workflow Efficiency**: 25% improvement in data scanning speed
- [ ] **User Adoption**: Positive feedback from Sales Manager validation

---

## **🔄 Post-Implementation Agent Review**

### **Agent Collaboration Assessment**
- [ ] **Cross-Agent Coordination**: Seamless handoffs between agents
- [ ] **Code Quality Consistency**: Uniform implementation patterns
- [ ] **Design System Adherence**: Cohesive visual language maintained
- [ ] **Testing Coverage**: Comprehensive validation across all implementations

### **Lessons Learned Documentation**
- [ ] **Agent Specialization Benefits**: Document efficiency gains from specialized agents
- [ ] **Workflow Optimization**: Identify improvements for future vertical scaling projects
- [ ] **Quality Assurance**: Validate agent-driven testing effectiveness
- [ ] **Knowledge Transfer**: Assess documentation completeness and accessibility

---

## **🚀 Agent-Driven Implementation Commands Summary**

### **Quick Reference for Agent Invocation**

```bash
# Stage 1: Foundation
@database-schema-architect extend tailwind configuration with entity color tokens and CSS custom properties for professional CRM color system using shadcn/ui MCP tool to verify component structure first

# Stage 2: Component System  
@coordinated-ui-component-builder create entity-aware badge, form, and card components with professional visual hierarchy using shadcn/ui MCP tool for component research and implementation patterns

# Stage 3: Entity Implementation
@database-schema-architect implement blue-themed organization components with professional styling and critical field emphasis using shadcn/ui MCP tool for all UI modifications
@crm-auth-manager implement green-themed contact components with relationship-focused styling and authority indicators using shadcn/ui MCP tool for all UI modifications
@analytics-reporting-engine implement purple-themed product components with category emphasis and principal relationship indicators using shadcn/ui MCP tool for all UI modifications
@coordinated-ui-component-builder implement orange-themed opportunity components with pipeline progression indicators and stage visualization using shadcn/ui MCP tool for all UI modifications
@activity-feed-builder implement yellow-themed interaction components with timeline context and communication type indicators using shadcn/ui MCP tool for all UI modifications

# Stage 4: Testing & QA
@testing-quality-assurance implement comprehensive testing strategy for CRM color-coding system including accessibility, performance, and user acceptance testing with shadcn/ui MCP tool verification of component compliance

# Stage 5: Deployment & Documentation
@crm-deployment-orchestrator implement staged deployment of color-coding system with performance monitoring and rollback capabilities
@documentation-knowledge-manager create comprehensive documentation for color-coding system including technical guides, user manuals, and training materials with shadcn/ui MCP tool reference for component documentation
```

### **Agent Workflow Validation**
- [ ] Each agent received clear, specific implementation instructions
- [ ] All agents required to use shadcn/ui MCP tool for UI-related tasks
- [ ] Agent responsibilities aligned with specialized capabilities
- [ ] Cross-agent dependencies properly managed
- [ ] Quality validation maintained throughout agent-driven process
- [ ] shadcn/ui MCP tool usage documented for all UI modifications

## **📝 Agent Implementation Notes**

### **Agent-Driven Design Philosophy**
- **Specialized Responsibility**: Each agent handles their domain of expertise
- **Professional Standards**: All agents maintain enterprise-grade quality standards
- **Cross-Agent Consistency**: Coordinated approach ensures cohesive implementation
- **Quality First**: Testing agent validates all implementations before deployment

### **Agent Coordination Guidelines**
- **Clear Handoffs**: Each stage completes before next agent begins
- **shadcn/ui MCP Tool Mandatory**: All UI modifications must use shadcn/ui MCP tool first
- **Shared Standards**: Common design system and coding patterns following shadcn/ui conventions
- **Quality Gates**: Testing validation required between stages including shadcn/ui compliance
- **Documentation**: Each agent documents their implementation approach and shadcn/ui tool usage

### **Vertical Scaling Workflow Adherence**
- **Feature Requirements**: Clearly defined business value and success criteria
- **Technical Assessment**: Complexity and timeline properly estimated
- **Staged Implementation**: Day 1-2, Day 2-4, Day 4-6, Day 6-7, Day 7-8
- **Testing Integration**: QA validation throughout each stage
- **Documentation**: Knowledge transfer and user guides created

### **Agent Specialization Benefits**
- **Database Schema Architect**: Configuration expertise ensures professional foundation
- **Coordinated UI Component Builder**: Design system consistency across all components
- **Entity Specialists**: Domain-specific knowledge for each business entity
- **Testing Quality Assurance**: Comprehensive validation and performance optimization
- **Deployment Orchestrator**: Production-ready rollout with monitoring
- **Documentation Manager**: Complete knowledge transfer and training materials

### **Future Agent Workflow Enhancements**
- **Performance Monitoring**: Real-time metrics for agent effectiveness
- **Cross-Agent Learning**: Share optimization patterns between agents
- **Quality Metrics**: Measure agent-driven implementation success
- **Workflow Refinement**: Continuous improvement of agent coordination

---

**Document Status**: Ready for Agent-Driven Implementation  
**Implementation Approach**: Vertical Scaling with Specialized Agents  
**Next Review**: After each agent stage completion  
**Owner**: Development Team + Specialized Agents  
**Stakeholders**: Sales Managers, UX Team, Development Team, Agent Architecture

**Total Implementation Timeline**: 7-8 days with agent specialization  
**Agent Coordination**: Sequential stages with quality validation gates  
**Success Validation**: Each agent must complete validation checklist before handoff