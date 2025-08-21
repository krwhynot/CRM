---
allowed-tools: Grep, LS, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, BashOutput, KillBash, ListMcpResourcesTool, ReadMcpResourceTool, mcp__context7__resolve-library-id, mcp__context7__get-library-docs, mcp__playwright__browser_close, mcp__playwright__browser_resize, mcp__playwright__browser_console_messages, mcp__playwright__browser_handle_dialog, mcp__playwright__browser_file_upload, mcp__playwright__browser_install, mcp__playwright__browser_press_key, mcp__playwright__browser_type, mcp__playwright__browser_navigate, mcp__playwright__browser_navigate_back, mcp__playwright__browser_navigate_forward, mcp__playwright__browser_network_requests, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_drag, mcp__playwright__browser_hover, mcp__playwright__browser_select_option, mcp__playwright__browser_tab_list, mcp__playwright__browser_tab_new, mcp__playwright__browser_tab_select, mcp__playwright__browser_tab_close, mcp__playwright__browser_wait_for, Bash, Glob, Task
description: Complete a design review of the pending changes on the current branch
---

You are conducting a comprehensive design review following the rigorous standards of top Silicon Valley companies like Stripe, Airbnb, and Linear. You must deliver a thorough analysis of all UI/UX changes in the current branch.

## CURRENT BRANCH ANALYSIS

**GIT STATUS:**
```
!`git status`
```

**FILES MODIFIED:**
```
!`git diff --name-only origin/HEAD...`
```

**COMMIT HISTORY:**
```
!`git log --oneline --no-decorate origin/HEAD...HEAD`
```

**COMPLETE DIFF:**
```
!`git diff --merge-base origin/HEAD`
```

## PROJECT DESIGN STANDARDS

This KitchenPantry CRM project follows specific design principles:

### Component Guidelines (from docs/reference/shadcn-ui-guidelines.md)
- **✅ ALLOWED (8 components)**: form, input, select, textarea, button, card, label, checkbox
- **❌ BANNED (12 components)**: badge, avatar, separator, skeleton, tooltip, collapsible, accordion, popover, progress, alert, hover-card, sheet
- **🔄 CONDITIONAL (6 components)**: switch, dialog, tabs, radio-group, table, slider (require justification)

### Touch & Accessibility Standards
- **Minimum touch targets**: 44px (2.75rem) for all interactive elements
- **Font size minimum**: 16px to prevent iOS zoom
- **WCAG 2.1 AA compliance**: 4.5:1 color contrast minimum
- **iPad-first optimization**: Primary target device

### Design Principles (from docs/Coding_Rules.md)
1. **KISS Principle**: Use shadcn/ui components over custom implementations
2. **Mobile-First**: Start with mobile, scale up to desktop
3. **Component Composition**: Break UI into small, composable units
4. **Consistent Error Handling**: Toast for transient, Alert/Dialog for blocking
5. **Performance-First**: Minimize re-renders, optimize bundle size

## TASK OBJECTIVE

Use the **design-review-specialist agent** to conduct a comprehensive review of all changes shown in the diff above. The agent should:

1. **Analyze the complete diff** to understand scope and implementation approach
2. **Evaluate component usage** against project guidelines (allowed/banned components)
3. **Assess iPad/mobile optimization** and touch target compliance
4. **Test responsiveness** across multiple viewports if UI changes are present
5. **Validate accessibility** and WCAG 2.1 AA compliance
6. **Check visual consistency** with existing design patterns
7. **Review performance implications** of component choices

## REQUIRED OUTPUT

Return a comprehensive markdown design review report with:

### Structure Requirements
- **Executive Summary**: Overall assessment and key findings
- **Compliance Analysis**: Adherence to project's component guidelines
- **Findings by Severity**:
  - **[Blocker]**: Critical failures requiring immediate fix
  - **[High-Priority]**: Significant issues to address before merge
  - **[Medium-Priority]**: Improvements for follow-up
  - **[Nitpick]**: Minor aesthetic details (prefix with "Nit:")

### Content Requirements
- **Evidence-based feedback** with specific line references from the diff
- **Component usage validation** against allowed/banned lists
- **Touch target verification** for interactive elements
- **Mobile-first assessment** of responsive design choices
- **Performance impact** of implementation decisions
- **Positive acknowledgment** of good design decisions

Launch the design-review-specialist agent now to analyze the complete diff and generate the comprehensive report.