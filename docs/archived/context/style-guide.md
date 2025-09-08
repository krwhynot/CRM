# Master Food Brokers CRM - Style Guide v1.0
*The Complete Recipe Book for Consistent UI/UX*

---

## 🎨 Brand Personality: "The Trusted Partner"
**Modern Bistro meets Professional Service** - Warm, approachable, yet sophisticated. Like a restaurant where million-dollar deals happen over comfortable conversation.

---

## 1. Color Palette - "Garden to Table"
*Fresh, authentic, and grounded in quality relationships*

### Primary Colors
```css
--mfb-green: #7CB342;        /* Primary brand - Master Food Brokers green */
--mfb-clay: #EA580C;         /* Accent - Warm clay for CTAs */
--mfb-cream: #FEFEF9;        /* Background - Soft cream */
--mfb-sage-tint: #F0FDF4;    /* Surface - Light sage for cards */
--mfb-olive: #1F2937;        /* Text - Dark olive for readability */
```

### Semantic Colors
```css
--success: #7CB342;          /* Your green for positive actions */
--warning: #FBBF24;          /* Squash yellow for alerts */
--danger: #EF4444;           /* Radish red for errors */
--info: #0EA5E9;             /* Sky blue for information */
```

### Implementation in Tailwind
```javascript
// tailwind.config.js
colors: {
  primary: '#7CB342',
  accent: '#EA580C',
  background: '#FEFEF9',
  surface: '#F0FDF4',
}
```

---

## 2. Typography - "Modern Casual"
*Friendly professional that's easy on the eyes during long days*

### Font Stack
```css
--font-heading: 'Nunito', 'Source Sans Pro', system-ui, sans-serif;
--font-body: 'Nunito', 'Source Sans Pro', system-ui, sans-serif;
```

### Type Scale
| Element | Size/Line | Weight | Usage |
|---------|-----------|---------|--------|
| H1 | 32px/40px | Bold (700) | Page titles: "Organizations" |
| H2 | 24px/30px | Semibold (600) | Section headers: "Active Principals" |
| H3 | 18px/24px | Semibold (600) | Card headers, form sections |
| Body | 15px/24px | Regular (400) | General content, descriptions |
| Small | 13px/18px | Regular (400) | Timestamps, labels, hints |
| Button | 14px/20px | Medium (500) | All buttons and actions |

### Implementation
```html
<!-- Add to index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 3. Spacing System - "Comfortable Dining"
*Balanced breathing room without waste*

### Base Unit: 4px

| Token | Value | Usage |
|-------|--------|--------|
| xs | 4px | Tight groupings (label to input) |
| sm | 12px | Internal component spacing |
| md | 20px | Between components |
| lg | 32px | Section breaks |
| xl | 48px | Major page divisions |

### Component Spacing
- **Card padding**: 20px all sides
- **Button padding**: 12px vertical, 24px horizontal
- **Form field gaps**: 20px between fields
- **Table row height**: 48px minimum
- **Modal padding**: 24px

### CSS Variables
```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 12px;
  --spacing-md: 20px;
  --spacing-lg: 32px;
  --spacing-xl: 48px;
}
```

---

## 4. Component Patterns - "Warm Welcome"
*Soft, inviting, professional components*

### Buttons
```css
.btn-primary {
  background: var(--mfb-green);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
```

### Cards
```css
.card {
  background: var(--mfb-cream);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.07);
  transition: all 0.3s ease;
}
```

### Form Inputs
```css
.input {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.2s;
}

.input:focus {
  border-color: var(--mfb-green);
  box-shadow: 0 0 0 3px rgba(124,179,66,0.1);
}
```

---

## 5. Interaction States - "Attentive Server"
*Clear feedback without disruption*

### State Definitions

| State | Visual Change | Duration |
|-------|--------------|----------|
| Hover | Lift -2px, shadow grows, slight brighten | Instant |
| Focus | 2px green outline with soft glow | While focused |
| Active | Light green background, 3px left border | While active |
| Loading | Skeleton screens with progress | Until complete |
| Success | Slide-in notification with ✓ icon | 5 seconds |
| Error | Red outline, error text below | Until corrected |

### Notification Pattern
```javascript
// Success notification
{
  position: 'top-right',
  duration: 5000,
  icon: '✓',
  title: 'Success!',
  message: 'Organization saved successfully',
  style: {
    background: '#F0FDF4',
    borderLeft: '3px solid #7CB342'
  }
}
```

---

## 6. Data Display - "Chef's Selection"
*Smart, adaptive information presentation*

### Table Standards
- Hover highlights entire row (#F0FDF4)
- Sortable columns with ↕ indicators
- Smart pagination (10/25/50/100 options)
- Sticky header on scroll
- Flexible column widths

### Card Layouts
- Masonry/flexible grid
- Key information prominent (title, status, priority)
- Status shown as colored top bar
- Secondary info in smaller text

### Priority Visual System
| Priority | Icon | Treatment |
|----------|------|-----------|
| A+ | 🔴 Fire | Bold text, red badge |
| A | 🟠 Star | Orange highlight |
| B | 🟡 Flag | Yellow indicator |
| C | Gray dot | Standard display |
| D | Gray dot | Subdued/smaller |

### Empty States
```jsx
<EmptyState>
  <Icon name="folder-open" size={48} color="gray" />
  <h3>Let's add your first opportunity</h3>
  <p>Start building your pipeline</p>
  <Button>Create Opportunity</Button>
  <Link>Import from Excel</Link>
</EmptyState>
```

---

## 7. Mobile Adaptations
*Responsive breakpoints for field sales teams*

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

### Mobile Adjustments
- **Navigation**: Bottom tab bar instead of sidebar
- **Cards**: Single column, full width
- **Tables**: Horizontal scroll with frozen first column
- **Spacing**: Reduce to 75% of desktop values
- **Buttons**: Full width on mobile
- **Forms**: Single column always

---

## 8. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Install Nunito font
- [ ] Update Tailwind config with color palette
- [ ] Create spacing utility classes
- [ ] Update button components

### Phase 2: Components (Week 2)
- [ ] Apply card styles globally
- [ ] Update form components
- [ ] Implement notification system
- [ ] Add loading states

### Phase 3: Data Display (Week 3)
- [ ] Update table components
- [ ] Implement priority badges
- [ ] Create empty state components
- [ ] Add responsive layouts

### Phase 4: Polish (Week 4)
- [ ] Audit all interactions
- [ ] Mobile testing
- [ ] Create component library docs
- [ ] Team training

---

## 9. Component Examples

### Button Component
```jsx
// Primary CTA Button
<Button 
  className="bg-[#7CB342] hover:bg-[#6BA132] 
             px-6 py-3 rounded-lg shadow-sm 
             hover:shadow-md transform hover:-translate-y-0.5 
             transition-all duration-200"
>
  Save Organization
</Button>
```

### Organization Card
```jsx
<Card className="p-5 bg-[#FEFEF9] rounded-lg shadow-sm 
                 hover:shadow-md transition-shadow">
  <div className="border-t-3 border-[#7CB342]">
    <Badge className="bg-orange-100 text-orange-700">
      A Priority
    </Badge>
    <h3 className="text-lg font-semibold mt-2">
      Restaurant Name
    </h3>
    <p className="text-sm text-gray-600 mt-1">
      Last contact: 2 days ago
    </p>
  </div>
</Card>
```

### Form Field
```jsx
<div className="space-y-2">
  <Label className="text-sm font-medium">
    Organization Name
  </Label>
  <Input 
    className="rounded-lg border-gray-200 
               focus:border-[#7CB342] focus:ring-2 
               focus:ring-[#7CB342]/20"
    placeholder="Enter organization name..."
  />
  <p className="text-xs text-gray-500">
    This will be the primary display name
  </p>
</div>
```

---

## 10. Do's and Don'ts

### ✅ DO's
- Use MFB green for primary actions
- Maintain 20px spacing between major elements
- Show loading states for actions > 1 second
- Use color + icon for priority indicators
- Provide hover states on all interactive elements

### ❌ DON'TS
- Don't use more than 3 font sizes per screen
- Don't rely on color alone for meaning
- Don't skip loading states
- Don't use sharp corners (minimum 4px radius)
- Don't hide critical actions in menus

---

## Living Document Notes

This style guide is version 1.0 and should evolve based on:
- User feedback from sales team
- Performance metrics
- New feature requirements
- Accessibility audits

**Last Updated**: January 2025  
**Next Review**: After first 10 users  
**Owner**: UI/UX Team

---

*Remember: This style guide ensures every interaction feels like being served by an attentive professional who anticipates your needs without being intrusive. Every element should feel warm, welcoming, and purposeful.*