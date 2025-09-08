# Manual Testing Checklist: Opportunity Interaction Timeline & Quick Add

## Overview
This checklist covers manual testing for Phase 6 of the opportunity interaction timeline and quick add functionality, focusing on different interaction counts, browser compatibility, and device testing.

## Prerequisites
- Access to CRM system with test data
- Test opportunities with varying interaction counts (0, 1, 10, 100+ interactions)
- Test devices: Desktop, iPad, iPhone/Android phone
- Multiple browsers: Chrome, Safari, Firefox
- Different user roles/permissions

---

## Test Data Requirements

### Interaction Count Scenarios
- **Zero Interactions**: Fresh opportunity with no interactions
- **Single Interaction**: Opportunity with exactly 1 interaction
- **Medium Dataset**: Opportunity with 10-15 interactions
- **Large Dataset**: Opportunity with 100+ interactions
- **Mixed Types**: Interactions of all types (call, email, meeting, demo, etc.)

### Browser & Device Matrix
| Device | Chrome | Safari | Firefox | Notes |
|--------|--------|--------|---------|-------|
| Desktop (1920x1080) | ✅ | ✅ | ✅ | Primary testing environment |
| iPad (768x1024) | ✅ | ✅ | N/A | Primary mobile target |
| iPhone (375x667) | ✅ | ✅ | N/A | Secondary mobile target |
| Android Phone | ✅ | N/A | ✅ | Firefox mobile support |

---

## Test Cases

### 1. Zero Interactions Scenario

#### Desktop Testing
- [ ] **Load opportunity with 0 interactions**
  - Expand opportunity row
  - Verify empty state displays correctly
  - Check "No activities logged yet" message appears
  - Verify "Add New" button is present and functional

- [ ] **Quick add from empty state**
  - Click "Add New" from empty state
  - Verify quick add form appears
  - Test all interaction types (call, email, meeting, note, demo)
  - Submit interaction and verify it appears immediately
  - Verify interaction count updates from 0 to 1

#### Mobile Testing (iPad)
- [ ] **Touch targets and layout**
  - Expand opportunity with touch
  - Verify empty state is readable and centered
  - Check "Add New" button is at least 44px touch target
  - Test quick add form with touch interactions

- [ ] **Form interaction on mobile**
  - Tap interaction type buttons (ensure 44px minimum)
  - Test virtual keyboard interaction with form fields
  - Verify form doesn't break layout when keyboard appears
  - Test submit and cancel buttons are easily touchable

#### Mobile Testing (iPhone)
- [ ] **Compact layout**
  - Verify timeline fits screen width
  - Check empty state message is concise
  - Test quick add form in portrait/landscape orientations
  - Ensure all buttons remain accessible

### 2. Single Interaction Scenario

#### Desktop Testing
- [ ] **Display single interaction**
  - Expand opportunity with 1 interaction
  - Verify interaction displays correctly in timeline
  - Check interaction type icon and color coding
  - Test interaction expansion (if applicable)
  - Verify "Activity (1)" tab label

- [ ] **Add second interaction**
  - Use quick add to create second interaction
  - Verify both interactions appear in timeline
  - Check interactions are ordered by date (newest first)
  - Verify interaction count updates to "Activity (2)"

#### Mobile Testing
- [ ] **Single item mobile layout**
  - Verify interaction item has proper spacing
  - Check touch targets for interaction elements
  - Test interaction expansion on mobile
  - Verify timeline line displays correctly

### 3. Medium Dataset (10 interactions)

#### Desktop Testing
- [ ] **Timeline rendering**
  - Expand opportunity with 10 interactions
  - Verify all interactions load and display
  - Check timeline maintains proper spacing
  - Test "Show More/Less" functionality
  - Verify lazy loading works when expanding row

- [ ] **Scrolling and performance**
  - Test timeline scrolling (should have max height)
  - Verify scrollbar appears and functions
  - Check interaction expansion states persist during scrolling
  - Test adding new interaction to medium dataset

#### Mobile Testing
- [ ] **Mobile performance**
  - Check loading time on mobile (should be <3 seconds)
  - Verify smooth scrolling on touch devices
  - Test "Show More/Less" with fewer items on mobile
  - Check timeline doesn't cause horizontal scroll

- [ ] **Memory usage**
  - Monitor browser memory during testing
  - Test rapid expand/collapse of multiple opportunities
  - Verify no memory leaks with interaction components

### 4. Large Dataset (100+ interactions)

#### Desktop Testing
- [ ] **Performance with large dataset**
  - Expand opportunity with 100+ interactions
  - Verify initial load shows limited items (3-4)
  - Test "Show More" reveals additional interactions
  - Check lazy loading prevents initial performance hit
  - Verify total interaction count in tab ("Activity (100+)")

- [ ] **Pagination and virtual scrolling**
  - Test gradual loading of interactions
  - Verify timeline container respects max height
  - Check scrolling performance with large dataset
  - Test search/filter functionality (if available)

#### Mobile Testing
- [ ] **Large dataset on mobile**
  - Verify mobile shows even fewer initial items (2)
  - Test "Show More" functionality on touch
  - Check loading states and animations
  - Verify app remains responsive during large data operations

- [ ] **Network considerations**
  - Test on slower mobile network (3G simulation)
  - Verify loading indicators appear appropriately
  - Check timeout handling for slow connections
  - Test offline/online state transitions

### 5. Mixed Interaction Types

#### All Devices
- [ ] **Type variety testing**
  - Create opportunity with all interaction types:
    - [ ] Call (phone icon, blue color)
    - [ ] Email (mail icon, green color)
    - [ ] Meeting (calendar icon, purple color)
    - [ ] Demo (users icon, orange color)  
    - [ ] Note (message icon, gray color)
  - Verify each type displays correct icon and color
  - Test interaction type filtering (if available)

- [ ] **Quick add type selection**
  - Test creating each interaction type via quick add
  - Verify auto-fill text changes based on type
  - Check type selection persists during form interaction
  - Test default type selection (should be 'Note')

---

## Browser-Specific Tests

### Chrome Testing
- [ ] **Chrome Desktop**
  - Test all core functionality
  - Check DevTools console for errors
  - Verify responsive design tools accuracy
  - Test performance profiling

- [ ] **Chrome Mobile**
  - Test on actual mobile Chrome browser
  - Verify touch interactions
  - Check mobile-specific features
  - Test PWA functionality (if applicable)

### Safari Testing
- [ ] **Safari Desktop**
  - Test macOS Safari compatibility
  - Check for Safari-specific rendering issues
  - Verify touch/trackpad interactions
  - Test private browsing mode

- [ ] **Safari Mobile (iOS)**
  - Test on actual iPhone/iPad
  - Check iOS-specific interactions
  - Verify viewport meta tag behavior
  - Test home screen app functionality

### Firefox Testing
- [ ] **Firefox Desktop**
  - Test core functionality
  - Check for Firefox-specific issues
  - Verify developer tools compatibility
  - Test accessibility features

- [ ] **Firefox Mobile**
  - Test Android Firefox compatibility
  - Check mobile-specific features
  - Verify touch interactions

---

## Cross-Device Integration Tests

### Multi-User Scenarios
- [ ] **Concurrent usage**
  - Two users viewing same opportunity simultaneously
  - One user adds interaction while other has timeline open
  - Verify real-time updates (if implemented)
  - Check conflict resolution

### Data Consistency
- [ ] **Cross-device data sync**
  - Add interaction on desktop
  - Verify it appears on mobile refresh
  - Test timestamp consistency across devices
  - Check interaction count updates across devices

---

## Performance Benchmarks

### Load Time Targets
- [ ] **Desktop**: Timeline loads in <1 second
- [ ] **iPad**: Timeline loads in <2 seconds
- [ ] **Mobile**: Timeline loads in <3 seconds
- [ ] **Quick Add**: Form submission completes in <1 second

### Memory Usage
- [ ] **Desktop**: <50MB additional memory per opportunity
- [ ] **Mobile**: <25MB additional memory per opportunity
- [ ] **Memory cleanup**: Verify memory released when opportunity collapsed

### Network Usage
- [ ] **Initial load**: <100KB per opportunity timeline
- [ ] **Lazy loading**: Additional data loaded only when needed
- [ ] **Efficient caching**: Subsequent loads use cached data

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Test Enter/Space key activation
- [ ] Verify focus indicators are visible
- [ ] Test Escape key to cancel forms

### Screen Reader Testing
- [ ] Test with macOS VoiceOver
- [ ] Verify ARIA labels are read correctly
- [ ] Check interaction type announcements
- [ ] Test form field descriptions

### Color and Contrast
- [ ] Test with color blindness simulation
- [ ] Verify sufficient color contrast (4.5:1 minimum)
- [ ] Check information isn't conveyed by color alone
- [ ] Test high contrast mode compatibility

---

## Error Scenarios

### Network Issues
- [ ] **Offline mode**
  - Test behavior when network is lost
  - Verify graceful degradation
  - Check error messages are helpful

- [ ] **Slow network**
  - Test on 3G simulation
  - Verify loading indicators appear
  - Check timeout handling

### Data Issues
- [ ] **Invalid data**
  - Test with malformed interaction data
  - Verify error boundaries prevent crashes
  - Check fallback content displays

- [ ] **Permission errors**
  - Test with insufficient permissions
  - Verify appropriate error messages
  - Check form disabling when appropriate

---

## Sign-off Checklist

### Functional Requirements
- [ ] All interaction types display correctly
- [ ] Quick add form works on all devices
- [ ] Timeline displays interactions in correct order
- [ ] Lazy loading improves performance
- [ ] Tab switching works properly

### Non-Functional Requirements
- [ ] Performance meets benchmarks on all devices
- [ ] Mobile UI is touch-friendly (44px minimum targets)
- [ ] Accessibility requirements met
- [ ] Error handling is graceful
- [ ] Cross-browser compatibility verified

### User Experience
- [ ] Interface is intuitive and easy to use
- [ ] Loading states provide appropriate feedback
- [ ] Mobile experience matches desktop functionality
- [ ] Error messages are helpful and actionable
- [ ] Visual design is consistent with rest of application

---

## Bug Report Template

When issues are found, use this template:

```
**Bug ID**: [Unique identifier]
**Priority**: [High/Medium/Low]
**Device**: [Desktop/iPad/iPhone/Android]
**Browser**: [Chrome/Safari/Firefox] [Version]
**Screen Size**: [Resolution or device]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happens]
**Screenshots**: [If applicable]
**Additional Notes**: [Any other relevant information]
```

---

## Test Completion Sign-off

**Tester**: _________________
**Date**: _________________
**Environment**: _________________
**Overall Status**: [ ] Pass [ ] Pass with Issues [ ] Fail

**Summary**:
[Brief summary of testing results and any major findings]

**Recommendations**:
[Any recommendations for fixes or improvements before release]