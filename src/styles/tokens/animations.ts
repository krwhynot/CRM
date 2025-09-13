/**
 * Animation Design Tokens
 *
 * Provides consistent animation timing, easing, and duration values
 * following Material Design and modern UI animation principles.
 */

// Animation Durations
export const animationDuration = {
  instant: '0ms',
  quick: '100ms',
  fast: '150ms',
  normal: '200ms',
  medium: '300ms',
  slow: '400ms',
  slower: '500ms',
  slowest: '700ms',
} as const

// Animation Easing Functions
export const animationEasing = {
  linear: 'cubic-bezier(0, 0, 1, 1)',
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',

  // Specialized easing for UI elements
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  back: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

  // Material Design easing
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',

  // CRM-specific easing
  tableSort: 'cubic-bezier(0.4, 0, 0.2, 1)',
  formTransition: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  modalEntry: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
} as const

// Animation Classes (Tailwind-compatible)
export const animationClasses = {
  // Fade animations
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',
  fadeInUp: 'animate-in fade-in slide-in-from-bottom-4',
  fadeInDown: 'animate-in fade-in slide-in-from-top-4',

  // Slide animations
  slideInLeft: 'animate-in slide-in-from-left',
  slideInRight: 'animate-in slide-in-from-right',
  slideInUp: 'animate-in slide-in-from-bottom',
  slideInDown: 'animate-in slide-in-from-top',

  // Scale animations
  scaleIn: 'animate-in zoom-in-95',
  scaleOut: 'animate-out zoom-out-95',

  // Rotation animations
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',

  // Custom CRM animations
  tableRowHighlight: 'transition-colors duration-200 ease-in-out',
  buttonPress: 'active:scale-95 transition-transform duration-100',
  cardHover: 'hover:scale-105 transition-transform duration-200',
  modalBackdrop: 'animate-in fade-in duration-200',

  // Loading states
  skeleton: 'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
  shimmer:
    'animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%]',
} as const

// Animation Combinations for Common UI Patterns
export const animationCombinations = {
  // Modal/Dialog entry
  modal: {
    backdrop: `${animationClasses.fadeIn} duration-200`,
    content: `${animationClasses.fadeInUp} duration-300`,
  },

  // Dropdown/Popover
  dropdown: {
    enter: `${animationClasses.fadeInDown} duration-150`,
    exit: `animate-out fade-out slide-out-to-top-1 duration-100`,
  },

  // Toast notifications
  toast: {
    enter: `${animationClasses.slideInRight} duration-300`,
    exit: `animate-out slide-out-to-right duration-200`,
  },

  // Table row interactions
  table: {
    rowHover: 'hover:bg-muted/50 transition-colors duration-150',
    rowSelect: 'bg-primary/10 transition-colors duration-200',
    sortTransition: 'transition-all duration-200 ease-out',
  },

  // Form field states
  form: {
    focus: 'focus:ring-2 focus:ring-primary/20 transition-all duration-200',
    error: 'border-destructive focus:ring-destructive/20 transition-colors duration-200',
    success: 'border-green-500 focus:ring-green-500/20 transition-colors duration-200',
  },

  // Button states
  button: {
    primary: 'hover:bg-primary/90 active:bg-primary/95 transition-colors duration-150',
    secondary: 'hover:bg-secondary/80 active:bg-secondary/90 transition-colors duration-150',
    ghost: 'hover:bg-accent/50 active:bg-accent/70 transition-colors duration-150',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin duration-1000 linear infinite',
    dots: 'animate-pulse duration-1500 ease-in-out infinite',
    skeleton: 'animate-pulse duration-2000 ease-in-out infinite',
  },
} as const

// Semantic Animation Tokens for CRM Context
export const semanticAnimations = {
  // Data operations
  dataLoad: animationCombinations.loading.skeleton,
  dataRefresh: `${animationClasses.fadeOut} duration-100 then ${animationClasses.fadeIn} duration-200`,
  dataUpdate: animationCombinations.table.rowHover,

  // User interactions
  clickFeedback: animationCombinations.button.primary,
  hoverState: 'hover:scale-102 transition-transform duration-150',
  focusState: animationCombinations.form.focus,

  // Navigation
  pageTransition: `${animationClasses.fadeInUp} duration-300`,
  tabSwitch: 'transition-all duration-200 ease-out',
  sidebarToggle: 'transition-transform duration-300 ease-in-out',

  // Feedback states
  success: 'animate-in zoom-in-95 fade-in duration-200',
  error: 'animate-in shake duration-300',
  warning: 'animate-bounce',

  // CRM-specific
  opportunityStageChange: 'transition-colors duration-300 ease-in-out',
  contactStatusUpdate: 'transition-all duration-250 ease-out',
  productAvailability: 'transition-opacity duration-200',
  interactionTimeline: 'animate-in slide-in-from-left duration-400',
} as const

// TypeScript types for better developer experience
export type AnimationDuration = keyof typeof animationDuration
export type AnimationEasing = keyof typeof animationEasing
export type AnimationClass = keyof typeof animationClasses
export type SemanticAnimation = keyof typeof semanticAnimations

// Animation utilities
export const createAnimation = (
  duration: AnimationDuration = 'normal',
  easing: AnimationEasing = 'ease',
  delay: number = 0
) => ({
  transitionDuration: animationDuration[duration],
  transitionTimingFunction: animationEasing[easing],
  transitionDelay: delay > 0 ? `${delay}ms` : '0ms',
})

// Animation presets for common patterns
export const animationPresets = {
  quickFade: createAnimation('fast', 'ease'),
  smoothSlide: createAnimation('medium', 'easeOut'),
  bouncyScale: createAnimation('medium', 'bounce'),
  subtleGlow: createAnimation('slow', 'easeInOut'),
  crispTransition: createAnimation('quick', 'standard'),
} as const
