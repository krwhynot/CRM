/**
 * Type definitions for jest-axe toHaveNoViolations matcher
 * This extends the Vitest expect interface with the jest-axe matchers
 */

declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toHaveNoViolations(): any
    }
  }
}

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): any
  }
}

export {}
