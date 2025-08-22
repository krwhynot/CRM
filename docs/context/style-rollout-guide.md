# Master Food Brokers CRM - Style Implementation Checklist
*Simple, actionable tasks to transform your CRM's look and feel*

---

## 🚦 **Pre-Flight Check** (15 minutes total)
*Do these before touching any code*

### Git Safety Setup (5 min)
- [ ] Open terminal in your CRM project folder
- [ ] Run: `git status` (make sure you have no uncommitted changes)
- [ ] Run: `git checkout -b feature/style-guide`
- [ ] Run: `git tag pre-style-backup`
- [ ] Create a test commit: `git commit --allow-empty -m "chore: start style guide implementation"`

### Project Backup (5 min)
- [ ] Copy `tailwind.config.js` to `tailwind.config.backup.js`
- [ ] Copy `src/index.css` to `src/index.backup.css`
- [ ] Take 3 screenshots: Dashboard, Organizations page, Add New form
- [ ] Save screenshots in `docs/style-guide/before/`

### Create Folders (5 min)
- [ ] Create folder: `src/styles/new/`
- [ ] Create folder: `src/components/ui/new/`
- [ ] Create folder: `docs/style-guide/progress/`
- [ ] Create file: `STYLE_GUIDE_TASKS.md` (copy this checklist there!)

---

## 🎨 **Level 1: Foundation** (30 minutes)
*These won't change anything visible yet*

### Add Nunito Font (10 min)
- [ ] Open `index.html`
- [ ] Find the `</head>` tag
- [ ] Add these lines just before `</head>`:
```html
<!-- Nunito Font for better readability -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
```
- [ ] Save the file
- [ ] Run `npm run dev`
- [ ] Open Chrome DevTools → Network tab
- [ ] Refresh page and verify Nunito font loads (search "nunito" in Network)
- [ ] Commit: `git commit -am "feat: add Nunito font family"`

### Create Color Variables File (10 min)
- [ ] Create new file: `src/styles/new/colors.css`
- [ ] Copy and paste this content:
```css
/* Master Food Brokers Brand Colors */
:root {
  /* Primary Palette */
  --mfb-green: #7CB342;
  --mfb-green-hover: #6BA132;
  --mfb-green-light: #7CB34220;
  
  /* Accent Colors */
  --mfb-clay: #EA580C;
  --mfb-clay-hover: #DC2626;
  
  /* Backgrounds */
  --mfb-cream: #FEFEF9;
  --mfb-sage-tint: #F0FDF4;
  --mfb-white: #FFFFFF;
  
  /* Text Colors */
  --mfb-olive: #1F2937;
  --mfb-olive-light: #4B5563;
  --mfb-olive-lighter: #9CA3AF;
  
  /* Semantic Colors */
  --mfb-success: #7CB342;
  --mfb-warning: #FBBF24;
  --mfb-danger: #EF4444;
  --mfb-info: #0EA5E9;
}
```
- [ ] Save the file
- [ ] Import in `src/index.css` at the top: `@import './styles/new/colors.css';`
- [ ] Check browser - no errors in console
- [ ] Commit: `git commit -am "feat: add MFB color variables"`

### Update Tailwind Config (10 min)
- [ ] Open `tailwind.config.js`
- [ ] Find the `theme:` section
- [ ] Inside `extend:`, add this colors block:
```javascript
colors: {
  'mfb': {
    'green': '#7CB342',
    'green-hover': '#6BA132',
    'clay': '#EA580C',
    'cream': '#FEFEF9',
    'sage': '#F0FDF4',
    'olive': '#1F2937',
  }
},
fontFamily: {
  'nunito': ['Nunito', 'system-ui', 'sans-serif'],
}
```
- [ ] Save the file
- [ ] Run `npm run build` to verify no errors
- [ ] Commit: `git commit -am "feat: extend Tailwind with MFB design tokens"`

---

## 🔧 **Level 2: Create Test Components** (45 minutes)
*Build new versions without breaking anything*

### Create Style Test Page (15 min)
- [ ] Create file: `src/pages/style-guide-test.tsx`
- [ ] Add this starter code:
```tsx
export function StyleGuideTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Style Guide Test Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Style</h2>
          {/* Old components will go here */}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">New Style</h2>
          {/* New components will go here */}
        </div>
      </div>
    </div>
  );
}
```
- [ ] Add route in your router file:
```tsx
{
  path: '/style-test',
  element: <StyleGuideTest />
}
```
- [ ] Navigate to `http://localhost:5173/style-test`
- [ ] Verify page loads
- [ ] Commit: `git commit -am "feat: add style guide test page"`

### Create New Button Component (15 min)
- [ ] Create file: `src/components/ui/new/Button.tsx`
- [ ] Add this code:
```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonNew = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-mfb-green hover:bg-mfb-green-hover text-white shadow-sm hover:shadow-md',
      secondary: 'bg-mfb-clay hover:bg-mfb-clay/90 text-white shadow-sm hover:shadow-md',
      danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md',
      ghost: 'bg-transparent hover:bg-mfb-sage text-mfb-olive'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          'font-nunito font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
```
- [ ] Save the file
- [ ] Import in test page: `import { ButtonNew } from '@/components/ui/new/Button'`
- [ ] Add test button: `<ButtonNew>Save Organization</ButtonNew>`
- [ ] Verify button appears and hover effects work
- [ ] Commit: `git commit -am "feat: create new button component"`

### Create New Card Component (15 min)
- [ ] Create file: `src/components/ui/new/Card.tsx`
- [ ] Add this code:
```tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const CardNew = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-mfb-cream rounded-lg p-5 shadow-sm transition-all duration-300',
          hover && 'hover:shadow-md hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold font-nunito text-mfb-olive', className)} {...props} />
  )
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-mfb-olive/80', className)} {...props} />
  )
);
```
- [ ] Import in test page
- [ ] Add test card with title and content
- [ ] Verify hover effect works
- [ ] Commit: `git commit -am "feat: create new card component"`

---

## 🎯 **Level 3: Apply to Real Components** (1 hour)
*Start updating actual CRM components*

### Update First Real Button (20 min)
- [ ] Find your main "Save" button (likely in a form)
- [ ] Locate the file (probably in `src/components/forms/`)
- [ ] Add feature flag at top of file:
```tsx
const USE_NEW_STYLE = localStorage.getItem('useNewStyle') === 'true';
```
- [ ] Import new button: `import { ButtonNew } from '@/components/ui/new/Button'`
- [ ] Conditionally render:
```tsx
{USE_NEW_STYLE ? (
  <ButtonNew type="submit">Save</ButtonNew>
) : (
  <Button type="submit">Save</Button>
)}
```
- [ ] In browser console, run: `localStorage.setItem('useNewStyle', 'true')`
- [ ] Refresh and verify new button appears
- [ ] Test form still submits correctly
- [ ] Run: `localStorage.removeItem('useNewStyle')` and verify old button returns
- [ ] Commit: `git commit -am "feat: add new style option to save button"`

### Update Dashboard Cards (20 min)
- [ ] Open `src/pages/Dashboard.tsx` (or similar)
- [ ] Find the stats cards (Total Organizations, etc.)
- [ ] Import new card: `import { CardNew } from '@/components/ui/new/Card'`
- [ ] Update one card as test:
```tsx
<CardNew>
  <CardHeader>
    <CardTitle>Total Organizations</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold font-nunito text-mfb-green">247</p>
    <p className="text-sm text-mfb-olive/60 mt-1">Active accounts</p>
  </CardContent>
</CardNew>
```
- [ ] Check alignment with other cards
- [ ] Verify responsive behavior
- [ ] Take screenshot for comparison
- [ ] Commit: `git commit -am "feat: update dashboard card with new style"`

### Style Priority Badges (20 min)
- [ ] Create file: `src/components/ui/new/PriorityBadge.tsx`
- [ ] Add this code:
```tsx
interface PriorityBadgeProps {
  priority: 'A+' | 'A' | 'B' | 'C' | 'D';
  showIcon?: boolean;
}

export function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
  const styles = {
    'A+': {
      bg: 'bg-red-100',
      text: 'text-red-700 font-bold',
      icon: '🔴',
      label: 'Critical'
    },
    'A': {
      bg: 'bg-orange-100', 
      text: 'text-orange-700 font-semibold',
      icon: '🟠',
      label: 'High'
    },
    'B': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: '🟡', 
      label: 'Medium'
    },
    'C': {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: '⚪',
      label: 'Low'
    },
    'D': {
      bg: 'bg-gray-50',
      text: 'text-gray-400',
      icon: '⚪',
      label: 'Minimal'
    }
  };
  
  const style = styles[priority];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-nunito ${style.bg} ${style.text}`}>
      {showIcon && <span className="mr-1">{style.icon}</span>}
      {priority}
    </span>
  );
}
```
- [ ] Find where priorities are displayed
- [ ] Replace with new badge component
- [ ] Test all priority levels display correctly
- [ ] Commit: `git commit -am "feat: add styled priority badges"`

---

## 📝 **Level 4: Forms & Inputs** (45 minutes)
*Making data entry more pleasant*

### Create Styled Input Component (15 min)
- [ ] Create file: `src/components/ui/new/Input.tsx`
- [ ] Add this code:
```tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const InputNew = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 font-nunito',
          'border rounded-lg transition-all duration-200',
          'placeholder:text-mfb-olive/40',
          error 
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-mfb-green focus:ring-2 focus:ring-mfb-green/20',
          'focus:outline-none',
          className
        )}
        {...props}
      />
    );
  }
);
```
- [ ] Test in style guide page
- [ ] Verify focus states work
- [ ] Test with error prop
- [ ] Commit: `git commit -am "feat: create styled input component"`

### Style Form Labels (10 min)
- [ ] Create file: `src/components/ui/new/Label.tsx`
- [ ] Add this code:
```tsx
import { LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const LabelNew = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium font-nunito text-mfb-olive mb-1.5',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);
```
- [ ] Test with input component
- [ ] Verify required indicator shows
- [ ] Commit: `git commit -am "feat: create styled label component"`

### Update One Complete Form (20 min)
- [ ] Choose a simple form (maybe "Add Contact")
- [ ] Apply new Input and Label components
- [ ] Add proper spacing between fields (20px)
- [ ] Style the submit button with ButtonNew
- [ ] Add form section dividers if needed:
```tsx
<div className="border-t border-gray-200 my-6 pt-6">
  <h3 className="text-base font-semibold font-nunito text-mfb-olive mb-4">
    Contact Information
  </h3>
  {/* form fields here */}
</div>
```
- [ ] Test form submission still works
- [ ] Check validation messages display correctly
- [ ] Screenshot before/after
- [ ] Commit: `git commit -am "feat: apply new style to contact form"`

---

## 🏃 **Level 5: Quick Wins** (30 minutes)
*Small changes with big impact*

### Update Page Headers (10 min)
- [ ] Find all main page titles (h1 tags)
- [ ] Add consistent styling:
```tsx
className="text-3xl font-bold font-nunito text-mfb-olive mb-6"
```
- [ ] Update page subtitles (if any):
```tsx
className="text-lg text-mfb-olive/70 font-nunito"
```
- [ ] Ensure consistent spacing below headers
- [ ] Commit: `git commit -am "feat: standardize page headers"`

### Style Loading States (10 min)
- [ ] Find your loading spinner/skeleton
- [ ] Update with MFB green color:
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mfb-green"></div>
```
- [ ] Add loading text:
```tsx
<p className="text-sm text-mfb-olive/60 font-nunito mt-2">Loading your data...</p>
```
- [ ] Test loading states work
- [ ] Commit: `git commit -am "feat: style loading states"`

### Update Success Messages (10 min)
- [ ] Find success notification/toast component
- [ ] Update styling:
```tsx
className="bg-mfb-sage border-l-4 border-mfb-green p-4 rounded-lg shadow-md"
```
- [ ] Add success icon: ✓
- [ ] Update text color to `text-mfb-olive`
- [ ] Test a successful action
- [ ] Commit: `git commit -am "feat: style success messages"`

---

## ✅ **Level 6: Final Polish** (30 minutes)

### Typography Consistency Check (10 min)
- [ ] Search project for "text-xl", "text-2xl", etc.
- [ ] Replace with consistent sizes from style guide
- [ ] Ensure all text uses `font-nunito`
- [ ] Check line-height is comfortable (1.5-1.6)
- [ ] Commit: `git commit -am "fix: standardize typography"`

### Spacing Audit (10 min)
- [ ] Check padding on all cards (should be p-5)
- [ ] Verify spacing between sections (use gap-6 or space-y-6)
- [ ] Ensure consistent margins around buttons
- [ ] Fix any cramped or excessive spacing
- [ ] Commit: `git commit -am "fix: standardize spacing"`

### Color Replacement (10 min)
- [ ] Search for hardcoded colors (#7CB342, etc.)
- [ ] Replace with CSS variables or Tailwind classes
- [ ] Ensure no random colors outside palette
- [ ] Update any missed hover states
- [ ] Commit: `git commit -am "fix: use color variables consistently"`

---

## 🎉 **Completion Checklist**

### Documentation
- [ ] Take "after" screenshots
- [ ] Create comparison document
- [ ] Update README with new style notes
- [ ] Document any custom utility classes created

### Team Handoff
- [ ] Remove test page (or move to /dev-tools)
- [ ] Clean up any console.logs
- [ ] Write summary of changes
- [ ] Schedule team demo

### Deployment Prep
- [ ] Run full build: `npm run build`
- [ ] Test all forms still submit
- [ ] Verify mobile responsiveness
- [ ] Check browser compatibility (Chrome, Firefox, Safari)
- [ ] Remove feature flags when ready

### Celebrate! 🎊
- [ ] Merge to main branch
- [ ] Tag release: `git tag style-guide-v1.0`
- [ ] Share before/after screenshots with team
- [ ] Order pizza for the team! 🍕

---

## 📊 **Progress Tracker**

Track your progress by counting checked boxes:

- **Pre-Flight**: ___/10 tasks
- **Level 1**: ___/10 tasks  
- **Level 2**: ___/13 tasks
- **Level 3**: ___/11 tasks
- **Level 4**: ___/10 tasks
- **Level 5**: ___/9 tasks
- **Level 6**: ___/9 tasks
- **Completion**: ___/13 tasks

**Total: ___/85 tasks**

---

## 💡 **Tips for Success**

1. **Do tasks in order** - Each builds on the previous
2. **Commit after each section** - Easy rollback if needed
3. **Test as you go** - Don't wait until the end
4. **Ask for feedback early** - Show teammates after Level 2
5. **Take breaks** - Do one level per day if needed

---

## 🆘 **If You Get Stuck**

**CSS not applying?**
- Check class name spelling
- Verify Tailwind config saved
- Try `npm run dev` restart

**Component not updating?**
- Clear browser cache
- Check import statements
- Verify feature flag is set

**Build errors?**
- Check for missing imports
- Verify no TypeScript errors
- Try `npm install` again

---

*Remember: Each small task completed makes your CRM more professional. You've got this! 🚀*