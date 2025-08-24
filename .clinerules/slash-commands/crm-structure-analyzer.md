---
name: crm-structure-analyzer
persona: MVP-focused CRM architecture specialist with 15+ years enterprise experience
task: Analyze KitchenPantry CRM structure and generate comprehensive PROJECT_STRUCTURE_OVERVIEW.md
---

## 🎯 Objective
Generate a detailed, human-readable structure map for the KitchenPantry CRM while preventing context overflow through strategic chunking and focused analysis.

## 📋 Execution Strategy

### Phase 1: Quick Architecture Assessment (5 min)
**Risk-Free Discovery**
- [ ] Scan root configuration files only (package.json, tsconfig.json, vite.config.ts)
- [ ] Identify primary tech stack and build tools
- [ ] Map top-level directory structure without deep traversal
- [ ] Note presence of dual application structure (Vite + Next.js)

**Output**: High-level architecture summary (< 500 words)

### Phase 2: Core Application Mapping (10 min)
**Chunked Analysis - Primary Vite App**
- [ ] `/src/components/` - Component architecture patterns
  - Focus: UI organization (shadcn/ui, dashboard, entities)
  - Skip: Individual component internals
- [ ] `/src/hooks/` - Custom hooks inventory
- [ ] `/src/lib/` - Utilities and configurations
- [ ] `/src/types/` - Type system structure


**Output**: Structured component inventory with purpose descriptions

### Phase 3: Entity & Feature Analysis (10 min)
**CRM-Specific Structure**
- [ ] Organizations feature structure
- [ ] Contacts management patterns
- [ ] Products catalog organization
- [ ] Opportunities pipeline structure
- [ ] Interactions logging system

**Pattern Detection**:
- [ ] Identify form patterns (validation, schemas)
- [ ] Map data flow (hooks → components → UI)
- [ ] Document state management approach
- [ ] Note authentication integration points

### Phase 4: Documentation Generation (5 min)
**Create PROJECT_STRUCTURE_OVERVIEW.md**

## 📄 Output Template

```markdown
# KitchenPantry CRM - Project Structure Overview
*Generated: [Date] | Version: [Git Hash]*

## 🏗️ Architecture Summary
- **Primary Stack**: React 18 + TypeScript + Vite + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel + Supabase Cloud

## 📂 Directory Structure

### Root Configuration
📁 **/** (Project Root)
├── 📄 package.json - Dependencies and scripts
├── 📄 vite.config.ts - Vite build configuration
├── 📄 tsconfig.json - TypeScript configuration
├── 📄 components.json - shadcn/ui configuration
└── 📄 tailwind.config.js - Tailwind CSS setup

### Primary Application (Vite + React)
📁 **/src/**
├── 📁 **components/** - React components
│   ├── 📁 ui/ - shadcn/ui primitives (buttons, forms, etc.)
│   ├── 📁 dashboard/ - Dashboard-specific components
│   ├── 📁 organizations/ - Organization management
│   ├── 📁 contacts/ - Contact management
│   ├── 📁 products/ - Product catalog
│   ├── 📁 opportunities/ - Sales pipeline
│   └── 📁 interactions/ - Communication tracking
│
├── 📁 **hooks/** - Custom React hooks
│   ├── useOrganizations.ts
│   ├── useContacts.ts
│   └── [other entity hooks]
│
├── 📁 **lib/** - Utilities and configurations
│   ├── supabase.ts - Supabase client
│   └── utils.ts - Helper functions
│
└── 📁 **types/** - TypeScript definitions
    ├── database.types.ts - Supabase types
    └── [entity].types.ts - Domain types

### Documentation
📁 **/docs/**
├── 📄 README.md - Documentation index
├── 📄 USER_GUIDE.md - Sales manager guide
├── 📄 TECHNICAL_GUIDE.md - Developer guide
└── 📄 database.md - Schema documentation


## 🔄 Data Flow Architecture
Client → Hooks → Supabase → PostgreSQL
        ↓
    Components → UI Updates

## ⚠️ Technical Debt & Cleanup Tasks
- [ ] Component duplication between features
- [ ] Missing shared component library
- [ ] Inconsistent naming patterns
- [ ] Test coverage gaps

## 📊 Metrics
- Total Components: [count]
- Custom Hooks: [count]
- Type Definitions: [count]
- Test Coverage: [percentage]
```

## 🛡️ Context Overflow Prevention Strategies

### 1. **Selective Depth Scanning**
- Only scan 2 levels deep initially
- Use file extension filters (.ts, .tsx, .json only)
- Skip node_modules, .git, build directories
- Ignore generated files and test snapshots

### 2. **Chunked Processing**
- Process one major directory at a time
- Clear working memory between chunks
- Summarize findings immediately
- Don't store full file contents

### 3. **Pattern Recognition Over Enumeration**
- Identify patterns rather than listing every file
- Group similar components together
- Focus on architectural decisions, not implementation details

### 4. **Progressive Enhancement**
- Start with essential structure
- Add detail only where it provides value
- Mark areas for future deep-dive analysis
- Create follow-up task list for detailed mapping

## 🚫 Skip List (Prevent Overflow)
- Individual component implementations
- Full file content analysis
- Line-by-line code review
- Detailed prop interfaces
- CSS/styling specifics
- Test file internals
- Build artifacts
- Package-lock.json details

## ✅ Success Metrics
- **Completeness**: All major directories documented
- **Clarity**: Non-technical stakeholders can understand
- **Actionability**: Clear improvement opportunities identified
- **Efficiency**: Analysis completed in < 30 minutes
- **Size**: Documentation < 5000 words

## 🔄 Follow-up Commands
After initial analysis, use targeted commands:
- `/analyze-component-patterns` - Deep dive on components
- `/map-data-flow` - Detailed data architecture
- `/identify-duplications` - Find refactoring opportunities
- `/create-migration-plan` - Monorepo migration strategy

## 💡 Usage Instructions

### Execute Command
```bash
/crm-structure-analyzer
```

### Expected Timeline
- **Phase 1**: 5 minutes (Architecture Assessment)
- **Phase 2**: 10 minutes (Core Application Mapping)
- **Phase 3**: 10 minutes (Entity & Feature Analysis)
- **Phase 4**: 5 minutes (Documentation Generation)
- **Total**: ~30 minutes

### Output Files
- `PROJECT_STRUCTURE_OVERVIEW.md` - Main structure documentation
- Follow-up task recommendations for deeper analysis

### Risk Mitigation
- **Progressive Enhancement**: Can stop at any phase if context fills
- **Chunked Processing**: Memory cleared between major sections
- **Skip Lists**: Prevents getting stuck on implementation details
- **Time Boxing**: Each phase has clear completion criteria

This command provides comprehensive CRM structure analysis while maintaining system performance and preventing context overflow errors.
