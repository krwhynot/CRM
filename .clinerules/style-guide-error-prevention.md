# Style Guide Implementation - Error Prevention Guide
*Avoiding TypeScript & Lint Errors During Your Style Migration*

---

## 🚨 **Common Errors & Prevention**

### **1. TypeScript Errors**

#### **Missing Type Definitions**
**❌ Error:** `Cannot find module '@/components/ui/new/Button' or its corresponding type declarations`

**✅ Prevention:**
```tsx
// When creating new components, ALWAYS export types too
// src/components/ui/new/Button.tsx

import { ButtonHTMLAttributes, forwardRef } from 'react';

// Export the interface
export interface ButtonNewProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// Use the exported interface
export const ButtonNew = forwardRef<HTMLButtonElement, ButtonNewProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    // component code
  }
);

// Add display name for React DevTools
ButtonNew.displayName = 'ButtonNew';
```

#### **Incompatible Props**
**❌ Error:** `Type '{ isLoading: boolean; }' is not assignable to type 'ButtonNewProps'`

**✅ Prevention:**
```tsx
// Make new components accept ALL props from old components
interface ButtonNewProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  // Add compatibility props from old button
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // Accept any additional props to prevent errors
  [key: string]: any;
}

// Or use a compatibility wrapper
export const ButtonNew: React.FC<ButtonNewProps> = ({ 
  isLoading, 
  leftIcon,
  rightIcon,
  children,
  ...props 
}) => {
  // Map old props to new behavior
  if (isLoading) {
    return (
      <button {...props} disabled>
        <Spinner /> Loading...
      </button>
    );
  }
  
  return (
    <button {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};
```

#### **Missing cn Utility Function**
**❌ Error:** `Cannot find name 'cn'`

**✅ Prevention:**
```tsx
// First, ensure you have the cn utility
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// If you don't have these packages:
// npm install clsx tailwind-merge
```

---

### **2. ESLint Warnings**

#### **Unused Variables During Migration**
**❌ Warning:** `'Button' is defined but never used`

**✅ Prevention:**
```tsx
// Option 1: Use ESLint disable comments during migration
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button';  // Old - will be removed
import { ButtonNew } from '@/components/ui/new/Button';  // New
/* eslint-enable @typescript-eslint/no-unused-vars */

// Option 2: Use both in conditional rendering
const USE_NEW_STYLE = localStorage.getItem('useNewStyle') === 'true';

// This way both are "used" and no warning
{USE_NEW_STYLE ? <ButtonNew /> : <Button />}

// Option 3: Prefix with underscore (convention for intentionally unused)
import { Button as _ButtonOld } from '@/components/ui/button';
```

#### **Import Order Warnings**
**❌ Warning:** `Import statements are not ordered correctly`

**✅ Prevention:**
```tsx
// Keep consistent import order:
// 1. React and external packages
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

// 2. Internal absolute imports
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

// 3. Components (old)
import { Button } from '@/components/ui/button';

// 4. Components (new) - grouped together
import { ButtonNew } from '@/components/ui/new/Button';
import { CardNew } from '@/components/ui/new/Card';

// 5. Types
import type { Organization } from '@/types';

// 6. Styles
import './styles.css';
```

#### **React Import in React 17+**
**❌ Warning:** `'React' must be in scope when using JSX`

**✅ Prevention:**
```tsx
// If you get this error, check your tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",  // This allows JSX without importing React
    // NOT "jsx": "react" which requires React import
  }
}

// Or just import React in new components to be safe
import React from 'react';  // Add this if getting errors
```

---

### **3. Tailwind CSS Class Warnings**

#### **Unknown Tailwind Classes**
**❌ Warning:** `The class 'bg-mfb-green' does not exist`

**✅ Prevention:**
```javascript
// Make sure Tailwind config is properly saved and reloaded
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Make sure this includes your new folders
  ],
  theme: {
    extend: {
      colors: {
        'mfb': {
          'green': '#7CB342',
          'green-hover': '#6BA132',
          // ... rest of colors
        }
      }
    }
  }
}

// After changing config:
// 1. Stop dev server (Ctrl+C)
// 2. Start again: npm run dev
// 3. Hard refresh browser (Ctrl+Shift+R)
```

#### **Arbitrary Value Warnings**
**❌ VS Code shows squiggly lines under `text-[32px]`**

**✅ Prevention:**
```tsx
// Option 1: Use Tailwind's built-in sizes when possible
className="text-3xl"  // Instead of text-[32px]

// Option 2: Add to safelist if you must use arbitrary values
// tailwind.config.js
module.exports = {
  safelist: [
    'text-[32px]',
    'leading-[40px]',
  ]
}

// Option 3: Use CSS variables
style={{ fontSize: 'var(--font-size-heading)' }}
```

---

### **4. Build-Time Errors**

#### **Module Resolution Errors**
**❌ Error:** `Failed to resolve import "@/components/ui/new/Button"`

**✅ Prevention:**
```json
// Check your vite.config.ts has the @ alias
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// Also check tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### **Type Declaration Files**
**❌ Error:** `Could not find a declaration file for module`

**✅ Prevention:**
```tsx
// Create a declarations file for new components
// src/components/ui/new/index.d.ts
export * from './Button';
export * from './Card';
export * from './Input';
export * from './Label';

// Or create individual .d.ts files
// src/components/ui/new/Button.d.ts
import { ButtonHTMLAttributes } from 'react';

export interface ButtonNewProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export declare const ButtonNew: React.FC<ButtonNewProps>;
```

---

### **5. Parallel Component Strategy (No Errors)**

#### **Safe Parallel Implementation**
```tsx
// src/components/ui/button-wrapper.tsx
// This wrapper prevents ALL errors during migration

import { Button as OldButton, ButtonProps as OldButtonProps } from './button';
import { ButtonNew, ButtonNewProps } from './new/Button';

// Feature flag
const USE_NEW_STYLE = process.env.NODE_ENV === 'development' 
  ? localStorage.getItem('useNewStyle') === 'true'
  : false;

// Union type accepts both prop types
type ButtonWrapperProps = OldButtonProps | ButtonNewProps;

// Smart wrapper component
export const Button: React.FC<ButtonWrapperProps> = (props) => {
  if (USE_NEW_STYLE) {
    // Type assertion to prevent errors
    return <ButtonNew {...(props as ButtonNewProps)} />;
  }
  return <OldButton {...(props as OldButtonProps)} />;
};

// Re-export types
export type ButtonProps = ButtonWrapperProps;
```

---

### **6. shadcn/ui Compatibility**

#### **Preventing Style Conflicts**
```tsx
// When using both old and new components, prevent CSS conflicts

// Option 1: Namespace your new styles
// src/styles/new/components.css
.new-style {
  /* Wrap new components in a class */
}

.new-style .button {
  /* New button styles */
}

// Option 2: Use CSS Modules
// Button.module.css
.button {
  /* Scoped to this component only */
}

// Option 3: Use unique prefixes
<button className="mfb-button-new">  // Instead of just "button"
```

#### **Form Library Compatibility**
```tsx
// If using React Hook Form with new components
import { forwardRef } from 'react';

// New components MUST forward refs for form libraries
export const InputNew = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  return <input ref={ref} {...props} />;
});

InputNew.displayName = 'InputNew';  // Helps with debugging
```

---

## 🛠️ **Pre-Implementation Setup**

### **1. Add These Dev Dependencies**
```bash
# Install helpful tools
npm install --save-dev \
  @types/node \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-react-hooks \
  eslint-plugin-unused-imports
```

### **2. Create Migration ESLint Config**
```json
// .eslintrc.migration.json
{
  "extends": "./.eslintrc.json",
  "rules": {
    // Temporarily relaxed rules during migration
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/prop-types": "off",
    "react/display-name": "warn",
    "import/order": "warn"
  }
}

// Use during migration:
// npm run lint -- --config .eslintrc.migration.json
```

### **3. Add Helper Scripts**
```json
// package.json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "lint:migration": "eslint . --config .eslintrc.migration.json",
    "check:styles": "npm run type-check && npm run lint:migration"
  }
}
```

---

## 📝 **Quick Reference Checklist**

Before creating each new component:
- [ ] Export interface/type for props
- [ ] Add `forwardRef` if it's a form element
- [ ] Add `.displayName` for debugging
- [ ] Include all props from old component
- [ ] Import `cn` utility if using it
- [ ] Test with TypeScript: `npm run type-check`

Before committing:
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint:migration`
- [ ] Run `npm run build`
- [ ] Test in browser with feature flag on/off

---

## 🚑 **Emergency Fixes**

### **"Just Make It Work" Solutions**

```tsx
// Type assertion escape hatch
{/* @ts-ignore */}
<ButtonNew {...props} />

// Any type escape hatch (use sparingly!)
const ButtonNew: any = LoadableButton;

// ESLint ignore for single line
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { OldComponent } from './old';

// Skip type checking for entire file (emergency only!)
// @ts-nocheck
```

### **Reset Everything**
```bash
# If things get really broken:
rm -rf node_modules package-lock.json
npm install
npm run type-check
npm run dev
```

---

## 💡 **Golden Rules**

1. **Always run `type-check` before committing**
2. **Keep old and new components separate** (different folders)
3. **Use feature flags** to switch between them
4. **Don't modify old components** until new ones are tested
5. **Commit working code frequently** (easier to rollback)
6. **Use `any` temporarily** but add TODO comments to fix later

---

## 📊 **Error Prevention Score**

Rate your setup (1 point each):
- [ ] cn utility installed and working
- [ ] TypeScript paths configured
- [ ] ESLint migration config created
- [ ] Feature flag system in place
- [ ] Type check script in package.json
- [ ] ForwardRef on all form components
- [ ] DisplayName on all components
- [ ] Build test passes

**Score: ___/8** (Aim for 6+ before starting migration)

---

*Remember: It's okay to use `@ts-ignore` temporarily during migration. Perfect types can come after everything works!*