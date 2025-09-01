/**
 * Type definitions for jest-axe toHaveNoViolations matcher
 * This extends the Vitest expect interface with the jest-axe matchers
 */

declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toHaveNoViolations(): void
    }
  }
}

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}

export {}
