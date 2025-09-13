/**
 * Accessibility Components
 *
 * Comprehensive accessibility system for WCAG 2.1 AA compliance.
 * Includes focus management, keyboard navigation, and screen reader support.
 */

// Focus management utilities
export {
  createFocusTrap,
  createFocusRestoration,
  useFocusTrap,
  useFocusRestoration,
  useAutoFocus,
  useArrowKeyNavigation,
  useFocusVisible,
  useAnnouncer,
  SkipLink,
  isFocusable,
  findFocusableSibling,
  type NavigationDirection,
  type SkipLinkProps,
} from '@/lib/accessibility/focus-management'

// Accessible dialog components
export {
  AccessibleDialog,
  AccessibleFormDialog,
  AccessibleConfirmDialog,
  useAccessibleDialog,
  useAccessibleFormDialog,
} from './AccessibleDialog'
