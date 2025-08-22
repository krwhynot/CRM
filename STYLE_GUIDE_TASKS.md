# Master Food Brokers CRM - Style Implementation Progress Tracker

*This file tracks progress on implementing the MFB style guide with error prevention.*

## 🚦 **Pre-Flight Check** (COMPLETED ✅)
- [x] Create git safety setup (branch, tag, empty commit)
- [x] Backup tailwind.config.js and src/index.css files
- [x] Create folder structure (src/styles/new/, src/components/ui/new/, docs/style-guide/progress/)
- [x] Create STYLE_GUIDE_TASKS.md checklist file

## 🎨 **Level 1: Foundation** (30 minutes)
*These won't change anything visible yet*

### Add Nunito Font (10 min)
- [ ] Add Google Fonts links to index.html (Nunito 400,500,600,700)
- [ ] Test font loading in browser DevTools Network tab
- [ ] Commit: `git commit -am "feat: add Nunito font family"`

### Create Color Variables File (10 min)
- [ ] Create new file: `src/styles/new/colors.css`
- [ ] Add Master Food Brokers brand colors as CSS variables
- [ ] Import in `src/index.css` at the top: `@import './styles/new/colors.css';`
- [ ] Verify no console errors
- [ ] Commit: `git commit -am "feat: add MFB color variables"`

### Update Tailwind Config (10 min)
- [ ] Open `tailwind.config.js` and extend colors with MFB palette
- [ ] Add Nunito font family to extend.fontFamily
- [ ] Run `npm run build` to verify no errors
- [ ] Commit: `git commit -am "feat: extend Tailwind with MFB design tokens"`

## 🔧 **Level 2: Create Test Components** (45 minutes)
*Build new versions without breaking anything*

### Create Style Test Page (15 min)
- [ ] Create file: `src/pages/StyleGuideTest.tsx`
- [ ] Add route in App.tsx for `/style-test`
- [ ] Navigate to `http://localhost:5173/style-test` and verify
- [ ] Commit: `git commit -am "feat: add style guide test page"`

### Create New Button Component (15 min)
- [ ] Create file: `src/components/ui/new/Button.tsx`
- [ ] Use forwardRef pattern with proper TypeScript
- [ ] Import in test page and verify button appears with hover effects
- [ ] Commit: `git commit -am "feat: create new button component"`

### Create New Card Component (15 min)
- [ ] Create file: `src/components/ui/new/Card.tsx`
- [ ] Include CardHeader, CardTitle, CardContent compound components
- [ ] Import in test page and verify hover effect works
- [ ] Commit: `git commit -am "feat: create new card component"`

## 🎯 **Level 3: Apply to Real Components** (1 hour)
*Start updating actual CRM components*

### Update First Real Button (20 min)
- [ ] Find main "Save" button in a form component
- [ ] Add feature flag: `const USE_NEW_STYLE = localStorage.getItem('useNewStyle') === 'true';`
- [ ] Conditionally render ButtonNew vs Button
- [ ] Test with localStorage flag (set true/false)
- [ ] Verify form submission still works
- [ ] Commit: `git commit -am "feat: add new style option to save button"`

### Update Dashboard Cards (20 min)
- [ ] Open Dashboard component and find stats cards
- [ ] Update one card with CardNew components
- [ ] Check alignment and responsive behavior
- [ ] Take screenshot for comparison
- [ ] Commit: `git commit -am "feat: update dashboard card with new style"`

### Style Priority Badges (20 min)
- [ ] Create file: `src/components/ui/new/PriorityBadge.tsx`
- [ ] Support A+, A, B, C, D priority levels with proper colors/icons
- [ ] Find where priorities are displayed and replace
- [ ] Test all priority levels display correctly
- [ ] Commit: `git commit -am "feat: add styled priority badges"`

## 📝 **Level 4: Forms & Inputs** (45 minutes)
*Making data entry more pleasant*

### Create Styled Input Component (15 min)
- [ ] Create file: `src/components/ui/new/Input.tsx`
- [ ] Use forwardRef for React Hook Form compatibility
- [ ] Support error prop and focus states
- [ ] Test in style guide page
- [ ] Commit: `git commit -am "feat: create styled input component"`

### Style Form Labels (10 min)
- [ ] Create file: `src/components/ui/new/Label.tsx`
- [ ] Support required field indicators
- [ ] Test with input component
- [ ] Commit: `git commit -am "feat: create styled label component"`

### Update One Complete Form (20 min)
- [ ] Choose simple form (Add Contact or similar)
- [ ] Apply InputNew, LabelNew, and ButtonNew components
- [ ] Add proper spacing and section dividers
- [ ] Test form submission and validation messages
- [ ] Screenshot before/after comparison
- [ ] Commit: `git commit -am "feat: apply new style to contact form"`

## 🏃 **Level 5: Quick Wins** (30 minutes)
*Small changes with big impact*

### Update Page Headers (10 min)
- [ ] Find all main page titles (h1 tags)
- [ ] Apply consistent styling: `text-3xl font-bold font-nunito text-mfb-olive mb-6`
- [ ] Update page subtitles with: `text-lg text-mfb-olive/70 font-nunito`
- [ ] Commit: `git commit -am "feat: standardize page headers"`

### Style Loading States (10 min)
- [ ] Find loading spinner/skeleton components
- [ ] Update with MFB green: `border-mfb-green`
- [ ] Add loading text: `text-mfb-olive/60 font-nunito`
- [ ] Test loading states work
- [ ] Commit: `git commit -am "feat: style loading states"`

### Update Success Messages (10 min)
- [ ] Find success notification/toast component
- [ ] Update styling: `bg-mfb-sage border-l-4 border-mfb-green`
- [ ] Add success icon and update text color
- [ ] Test a successful action
- [ ] Commit: `git commit -am "feat: style success messages"`

## ✅ **Level 6: Final Polish** (30 minutes)

### Typography Consistency Check (10 min)
- [ ] Search project for hardcoded text sizes
- [ ] Replace with consistent sizes from style guide
- [ ] Ensure all text uses `font-nunito`
- [ ] Check line-height is comfortable (1.5-1.6)
- [ ] Commit: `git commit -am "fix: standardize typography"`

### Spacing Audit (10 min)
- [ ] Check padding on all cards (should be p-5)
- [ ] Verify spacing between sections (gap-6 or space-y-6)
- [ ] Ensure consistent margins around buttons
- [ ] Fix any cramped or excessive spacing
- [ ] Commit: `git commit -am "fix: standardize spacing"`

### Color Replacement (10 min)
- [ ] Search for hardcoded colors and replace with CSS variables
- [ ] Ensure no random colors outside MFB palette
- [ ] Update any missed hover states
- [ ] Commit: `git commit -am "fix: use color variables consistently"`

## 🎉 **Completion Checklist**

### Documentation & Quality Assurance
- [ ] Take "after" screenshots for comparison
- [ ] Remove test page or move to dev tools
- [ ] Clean up console.logs and debug code
- [ ] Run full build: `npm run build`
- [ ] Run type check: `npm run type-check`
- [ ] Test all forms still submit correctly
- [ ] Verify mobile responsiveness (iPad focus)
- [ ] Check browser compatibility

### Final Steps
- [ ] Remove feature flags when ready for production
- [ ] Write summary of changes made
- [ ] Create comparison document with before/after
- [ ] Merge to main branch when approved
- [ ] Tag release: `git tag style-guide-v1.0`

---

## 📊 **Progress Tracker**

**Completed Tasks: 4/85**

- **Pre-Flight**: 4/4 ✅
- **Level 1**: 0/3
- **Level 2**: 0/3
- **Level 3**: 0/3
- **Level 4**: 0/3
- **Level 5**: 0/3
- **Level 6**: 0/3
- **Completion**: 0/12

---

## 💡 **Error Prevention Reminders**

✅ **ALWAYS use forwardRef** for form-compatible components
✅ **Extend Tailwind config** rather than replacing existing
✅ **Use feature flags** for safe production testing
✅ **Maintain prop compatibility** with existing components
✅ **Test after each component** creation
✅ **Commit frequently** with descriptive messages
✅ **Run type-check before commits** to catch errors

---

*Updated: $(date) - Keep this file updated as you progress!*