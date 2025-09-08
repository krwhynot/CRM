# CRM Contrast Analysis & WCAG Compliance Checklist

## 📖 **PROJECT CONTEXT**

### System Overview
This is a **KitchenPantry CRM 
system** built for Master Food Brokers (MFB) in the food service industry. The application uses:
- **Tech Stack**: React + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Primary Users**: Field sales managers using iPads in various lighting conditions
- **Brand Color**: MFB Green (#8DC63F) - a bright, distinctive green that must remain accessible
- **Design System**: Dual theme support (light/dark) with CSS custom properties

### Accessibility Requirements
- **WCAG 2.1 AA compliance** (minimum 4.5:1 contrast for normal text, 3:1 for large text)
- **WCAG 2.1 AAA preferred** (7:1 for normal text, 4.5:1 for large text) 
- **Mobile-first accessibility** optimized for iPad field usage
- **Brand integrity** must be maintained while meeting standards

### Development Environment
- **Dev Server**: `http://localhost:5174` (must be running)
- **Testing Tools**: Browser dev tools, contrast analyzers, design-review-specialist agent
- **Key Files**: `/src/index.css` (color definitions), `/src/components/ui/` (component variants)

---

## 🎯 **PHASE 1: ENVIRONMENT SETUP & BASELINE TESTING**

### ☐ 1.1 Development Server Verification
**What**: Confirm the CRM application is running locally  
**Why**: Live testing provides accurate contrast measurements vs. theoretical calculations  
**How**: Navigate to `http://localhost:5174` and verify application loads properly  
**Success Criteria**: Homepage displays with navigation, can switch between light/dark themes

### ☐ 1.2 Theme Switching Validation  
**What**: Test light/dark mode toggle functionality  
**Why**: Both themes must maintain WCAG compliance independently  
**How**: Locate theme toggle (usually in header/settings) and switch between modes  
**Success Criteria**: All content remains visible and readable in both themes

### ☐ 1.3 Browser Tools Setup
**What**: Configure browser developer tools for contrast analysis  
**Why**: Accurate contrast measurement requires proper tooling  
**How**: Enable accessibility auditing in Chrome/Firefox dev tools, install contrast checker extensions  
**Success Criteria**: Can measure contrast ratios for any text/background combination

---

## 🔍 **PHASE 2: TEXT CONTRAST ANALYSIS**

### ☐ 2.1 Primary Text Validation
**What**: Measure contrast of main body text against backgrounds  
**Why**: Most critical for overall readability  
**Expected Values**:
- Light mode: `#171717` on `#FAFAFA` (should be ~16:1 - AAA)
- Dark mode: `#FAFAFA` on `#0A0A0B` (should be ~16:1 - AAA)  
**Test Locations**: Any paragraph text, table content, form labels  
**Pass/Fail**: Must achieve 4.5:1 minimum (7:1 for AAA)

### ☐ 2.2 Muted Text Assessment  
**What**: Check secondary/muted text contrast  
**Why**: These often fail contrast requirements but are used for less critical information  
**Expected Values**:
- Light mode: `#666666` on `#FAFAFA` (~4.5:1 - borderline)
- Dark mode: `#A6A6A6` on `#0A0A0B` (~4.2:1 - potential failure)  
**Test Locations**: Captions, helper text, timestamps, secondary information  
**Action Required**: If below 4.5:1, recommend darker colors

### ☐ 2.3 Brand Color Validation
**What**: Verify MFB Green accessibility across contexts  
**Why**: Brand color must work while maintaining visual identity  
**Expected Values**: MFB Green `#8DC63F` should achieve ~4.9:1 on white backgrounds  
**Test Locations**: Primary buttons, links, accent elements  
**Brand Constraint**: Cannot significantly alter brand color - adjust backgrounds instead

---

## 🎨 **PHASE 3: COMPONENT CONTRAST AUDIT**

### ☐ 3.1 Button Variants Testing
**What**: Test all button states and variants  
**Components to Test**:
- Default (MFB Green background)
- Secondary (gray background)  
- Outline (border only)
- Ghost (transparent background)
- Destructive (red/error)
- Success (green)
- Warning (yellow/amber)

**States to Test**: Default, hover, focus, active, disabled  
**Why**: Buttons are primary interaction elements - must be clearly distinguishable  
**Focus Areas**: Text on button backgrounds, focus ring visibility, hover state contrast

### ☐ 3.2 Form Component Analysis
**What**: Validate form inputs, labels, and validation messages  
**Components to Test**:
- Input fields (text, select, textarea)
- Form labels
- Placeholder text
- Validation error messages
- Focus states and rings

**Why**: Forms are critical for data entry - poor contrast causes errors  
**Special Attention**: Error messages must be highly visible, focus rings must meet 3:1 contrast

### ☐ 3.3 Status Indicator Evaluation
**What**: Check semantic color indicators  
**Critical Issue**: Status indicators currently use hardcoded Tailwind colors instead of CSS variables  
**Components to Test**:
- Success indicators (green variants)
- Warning indicators (yellow/amber variants)
- Error/destructive indicators (red variants)
- Info indicators (blue variants)

**Architecture Problem**: These don't respect theme switching properly  
**Required Action**: Must be migrated to use CSS custom properties

---

## 📱 **PHASE 4: MOBILE & RESPONSIVE TESTING**

### ☐ 4.1 iPad Portrait Testing
**What**: Test contrast at iPad dimensions (768px portrait)  
**Why**: Primary device for field sales teams  
**Viewport**: 768px × 1024px  
**Focus Areas**: Touch target visibility, form input clarity, table readability

### ☐ 4.2 Outdoor Visibility Simulation
**What**: Test contrast under simulated bright conditions  
**Why**: Field sales teams use iPads outdoors where glare reduces perceived contrast  
**Method**: Increase screen brightness to maximum, test in well-lit environment  
**Higher Standards**: May need AAA compliance (7:1) instead of AA (4.5:1) for critical elements

### ☐ 4.3 Small Screen Adaptation
**What**: Test at mobile phone dimensions (375px)  
**Why**: Occasional mobile usage requires accessibility  
**Focus Areas**: Navigation collapse behavior, form layout, table scrolling

---

## 📊 **PHASE 5: PAGE-BY-PAGE CONSISTENCY**

### ☐ 5.1 Authentication Pages
**What**: Login, signup, password reset forms  
**Why**: Entry point to application - must be accessible to all users  
**Test Elements**: Form labels, input fields, error messages, submit buttons, links

### ☐ 5.2 CRUD Pages (Organizations, Contacts, Products, Opportunities)
**What**: Main data management interfaces  
**Why**: Core business functionality used daily  
**Test Elements**: Data tables, status badges, action buttons, search filters, pagination

### ☐ 5.3 Dashboard Analysis
**What**: Metrics cards, charts, activity feeds  
**Why**: Primary information interface for decision-making  
**Test Elements**: Metric displays, chart legends, activity timestamps, navigation elements

### ☐ 5.4 Cross-Page Consistency Check
**What**: Compare identical components across different pages  
**Why**: Inconsistent contrast creates poor user experience  
**Method**: Test same component types (buttons, badges, alerts) on multiple pages

---

## 🚨 **PHASE 6: SEMANTIC STATES & ALERTS**

### ☐ 6.1 Success States
**What**: Positive feedback and successful actions  
**Examples**: Form submission confirmation, saved changes, completed tasks  
**Standard**: Green indicators must meet 3:1 minimum against backgrounds

### ☐ 6.2 Warning States  
**What**: Cautionary information and pending actions  
**Examples**: Unsaved changes, approaching limits, optional field guidance  
**Standard**: Yellow/amber must be distinguishable from both success and error colors

### ☐ 6.3 Error States
**What**: Critical problems requiring user attention  
**Examples**: Form validation errors, system failures, access denied messages  
**Standard**: Must achieve highest contrast possible while remaining on-brand

### ☐ 6.4 Info States
**What**: Neutral information and guidance  
**Examples**: Help text, feature explanations, progress updates  
**Standard**: Must not compete with more critical semantic states

---

## 🔧 **PHASE 7: INTERACTIVE STATES TESTING**

### ☐ 7.1 Focus Visibility
**What**: Keyboard navigation indicators  
**WCAG Requirement**: Focus indicators must have 3:1 contrast against background  
**Test Method**: Tab through all interactive elements  
**Critical Elements**: Buttons, links, form inputs, dropdown menus

### ☐ 7.2 Hover States
**What**: Mouse interaction feedback  
**Why**: Provides visual feedback for actionable elements  
**Test Areas**: All clickable elements should have clear hover indication

### ☐ 7.3 Active/Pressed States  
**What**: Visual feedback during interaction  
**Why**: Confirms user action registration  
**Touch Considerations**: Must work well on iPad touch interface

### ☐ 7.4 Disabled States
**What**: Non-interactive element appearance  
**Why**: Must clearly indicate unavailability without becoming invisible  
**Standard**: Should maintain some contrast while appearing disabled

---

## 📋 **PHASE 8: DATA VISUALIZATION & TABLES**

### ☐ 8.1 Data Table Analysis
**What**: Tabular data display contrast  
**Elements**: Headers, cell content, row alternation, selected states  
**Why**: Critical for data comprehension and scanning

### ☐ 8.2 Chart and Graph Validation
**What**: Visual data representation accessibility  
**Elements**: Chart colors, legends, axis labels, data points  
**Standard**: Must not rely solely on color to convey information

### ☐ 8.3 Badge and Tag Systems
**What**: Status and category indicators  
**Current Issue**: May use hardcoded colors instead of theme-aware variables  
**Test Areas**: Status badges, priority indicators, category tags

---

## 📝 **REPORTING & DOCUMENTATION REQUIREMENTS**

### ☐ 9.1 Contrast Measurement Documentation
**What**: Record specific contrast ratios for all tested combinations  
**Format**: Element type, colors used (hex), measured ratio, WCAG level achieved  
**Tools**: Browser dev tools, online contrast calculators, screenshots

### ☐ 9.2 Issue Prioritization Matrix
**What**: Categorize findings by severity and impact  
**Categories**:
- **Critical**: WCAG failures that prevent usage
- **High**: Significant accessibility barriers  
- **Medium**: Improvements for better experience
- **Low**: Minor enhancements

### ☐ 9.3 Architecture Recommendations
**What**: Structural improvements to prevent future issues  
**Focus Areas**: 
- CSS variable consolidation
- Component variant standardization
- Theme consistency improvements
- Design system governance

### ☐ 9.4 Implementation Roadmap
**What**: Prioritized list of fixes with effort estimates  
**Include**: Quick wins, major refactoring needs, long-term improvements  
**Context**: Consider business priorities and development capacity

---

## ✅ **SUCCESS CRITERIA & VALIDATION**

### Minimum Requirements (Must Achieve)
- [ ] **All text content** meets WCAG 2.1 AA (4.5:1 normal text, 3:1 large text)
- [ ] **Interactive elements** have 3:1 contrast for non-text elements  
- [ ] **Focus indicators** are clearly visible with 3:1 contrast
- [ ] **Error messages** achieve high contrast for critical visibility
- [ ] **Theme consistency** - both light and dark modes comply equally

### Preferred Goals (Should Achieve)  
- [ ] **Primary content** meets WCAG 2.1 AAA (7:1 normal text, 4.5:1 large text)
- [ ] **Brand color integration** maintains accessibility without losing identity
- [ ] **Mobile optimization** exceeds minimum requirements for field usage
- [ ] **Design system consistency** - all components use standardized approach

### Completion Validation
- [ ] **Cross-browser testing** confirms consistency across Chrome, Safari, Firefox
- [ ] **User testing** with individuals who have visual impairments  
- [ ] **Automated accessibility scanning** passes with no contrast violations
- [ ] **Legal compliance verification** meets organizational accessibility requirements

---

## 🛠️ **TOOLS & RESOURCES**

### Required Tools
- **Browser Dev Tools**: Chrome/Firefox accessibility panels
- **Contrast Analyzers**: WebAIM, Colour Contrast Analyser, browser extensions
- **Design Review Agent**: For systematic testing and screenshot capture

### Reference Standards
- **WCAG 2.1 Guidelines**: Official accessibility standards
- **WebAIM Resources**: Practical accessibility guidance  
- **Brand Guidelines**: MFB color and typography standards

### Testing Environment
- **Development Server**: Must be running on localhost:5174
- **Test Devices**: Desktop, iPad (768px), mobile (375px)
- **Lighting Conditions**: Normal indoor, bright/outdoor simulation

This checklist ensures comprehensive contrast analysis without requiring deep knowledge of the codebase, providing context and rationale for each testing phase.