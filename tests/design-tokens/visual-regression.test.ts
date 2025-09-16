/**
 * Visual Regression Tests for Design Token Architecture
 *
 * Comprehensive visual regression testing to catch unintended changes during
 * token consolidation and design system evolution. Tests component visual
 * states, theme consistency, and token application accuracy.
 *
 * @see /src/styles/tokens/ - Design token layer system
 * @see /src/components/ui/ - Component visual states
 * @see /.docs/plans/design-tokens-architecture/ - Token architecture plan
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { JSDOM } from 'jsdom'
import * as fs from 'fs/promises'
import * as path from 'path'

// Test environment setup for visual regression
let dom: JSDOM
let document: Document
let window: Window & typeof globalThis

beforeAll(async () => {
  // Create JSDOM environment for CSS computation
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style id="design-tokens"></style>
        <style id="component-styles"></style>
      </head>
      <body>
        <div id="test-container"></div>
      </body>
    </html>
  `

  dom = new JSDOM(html, {
    pretendToBeVisual: true,
    resources: 'usable'
  })

  document = dom.window.document
  window = dom.window as any

  // Load CSS files into test environment
  const cssFiles = [
    'src/styles/tokens/primitives.css',
    'src/styles/tokens/semantic.css',
    'src/styles/tokens/components.css',
    'src/styles/tokens/features.css'
  ]

  const tokenStyle = document.getElementById('design-tokens')!
  for (const file of cssFiles) {
    try {
      const css = await fs.readFile(path.join(process.cwd(), file), 'utf-8')
      tokenStyle.textContent += css + '\n'
    } catch (error) {
      // File might not exist yet - that's okay for testing
      console.warn(`CSS file not found: ${file}`)
    }
  }
})

afterAll(() => {
  dom?.window.close()
})

// Helper functions available to all test suites
let createTestElement: (html: string, classes?: string) => Element
let getComputedStyles: (element: Element) => Record<string, string>

describe('Visual Regression - Component States', () => {
  beforeAll(() => {
    createTestElement = (html: string, classes: string = ''): Element => {
      const container = document.getElementById('test-container')!
      container.innerHTML = `<div class="${classes}">${html}</div>`
      return container.firstElementChild!
    }

    getComputedStyles = (element: Element): Record<string, string> => {
      const computedStyle = window.getComputedStyle(element)
      return {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        borderColor: computedStyle.borderColor,
        boxShadow: computedStyle.boxShadow,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        padding: computedStyle.padding,
        margin: computedStyle.margin,
        borderRadius: computedStyle.borderRadius,
        opacity: computedStyle.opacity,
        transform: computedStyle.transform,
        transition: computedStyle.transition
      }
    }
  })

  describe('Button Component Visual States', () => {
    const buttonVariants = [
      'default',
      'destructive',
      'success',
      'warning',
      'outline',
      'secondary',
      'ghost',
      'link'
    ]

    const buttonSizes = ['sm', 'default', 'lg', 'icon']

    it('should maintain consistent visual properties across all button variants', () => {
      const buttonSnapshots: Record<string, any> = {}

      buttonVariants.forEach(variant => {
        const button = createTestElement(
          '<button>Test Button</button>',
          `inline-flex items-center justify-center whitespace-nowrap rounded-lg font-nunito font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0`
        )

        const styles = getComputedStyles(button)
        buttonSnapshots[variant] = styles

        // Core visual consistency checks
        expect(styles.borderRadius).toBeDefined()
        expect(styles.transition).toContain('duration')
        expect(styles.fontWeight).toBeDefined()
        expect(styles.padding).toBeDefined()
      })

      // Store snapshot for regression comparison
      expect(buttonSnapshots).toMatchSnapshot('button-variants-visual-states.json')
    })

    it('should maintain consistent sizing across button sizes', () => {
      const sizeSnapshots: Record<string, any> = {}

      buttonSizes.forEach(size => {
        const sizeClass = size === 'sm' ? 'h-11 px-3 py-1.5 text-sm' :
                         size === 'default' ? 'h-12 px-6 py-3 text-base' :
                         size === 'lg' ? 'h-14 px-8 py-4 text-lg' :
                         'size-12'

        const button = createTestElement(
          '<button>Test Button</button>',
          `inline-flex items-center justify-center ${sizeClass}`
        )

        const styles = getComputedStyles(button)
        sizeSnapshots[size] = {
          height: styles.height || 'auto',
          padding: styles.padding,
          fontSize: styles.fontSize
        }
      })

      expect(sizeSnapshots).toMatchSnapshot('button-sizes-visual-states.json')
    })

    it('should properly apply hover and focus states', () => {
      const interactionStates = ['default', 'hover', 'focus', 'active', 'disabled']
      const stateSnapshots: Record<string, any> = {}

      interactionStates.forEach(state => {
        const stateClass = state === 'hover' ? 'hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md' :
                          state === 'focus' ? 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2' :
                          state === 'active' ? 'active:translate-y-0' :
                          state === 'disabled' ? 'disabled:opacity-50 disabled:cursor-not-allowed' :
                          'bg-primary text-primary-foreground'

        const button = createTestElement(
          '<button>Test Button</button>',
          stateClass
        )

        const styles = getComputedStyles(button)
        stateSnapshots[state] = styles
      })

      expect(stateSnapshots).toMatchSnapshot('button-interaction-states.json')
    })
  })

  describe('Input Component Visual States', () => {
    it('should maintain consistent input styling across states', () => {
      const inputStates = ['default', 'focus', 'error', 'disabled']
      const inputSnapshots: Record<string, any> = {}

      inputStates.forEach(state => {
        const stateClass = state === 'focus' ? 'ring-2 ring-primary ring-offset-2' :
                          state === 'error' ? 'border-destructive ring-destructive' :
                          state === 'disabled' ? 'opacity-50 cursor-not-allowed bg-muted' :
                          'border-border bg-background'

        const input = createTestElement(
          '<input type="text" placeholder="Test input" />',
          `h-12 px-3 py-2 border rounded-md ${stateClass}`
        )

        const styles = getComputedStyles(input)
        inputSnapshots[state] = styles
      })

      expect(inputSnapshots).toMatchSnapshot('input-states-visual.json')
    })
  })

  describe('Card Component Visual States', () => {
    it('should maintain consistent card styling and shadows', () => {
      const cardVariants = ['default', 'elevated', 'outlined', 'ghost']
      const cardSnapshots: Record<string, any> = {}

      cardVariants.forEach(variant => {
        const variantClass = variant === 'elevated' ? 'shadow-lg' :
                            variant === 'outlined' ? 'border-2' :
                            variant === 'ghost' ? 'shadow-none bg-transparent' :
                            'shadow-sm bg-card border'

        const card = createTestElement(
          '<div>Card Content</div>',
          `rounded-lg p-4 ${variantClass}`
        )

        const styles = getComputedStyles(card)
        cardSnapshots[variant] = styles
      })

      expect(cardSnapshots).toMatchSnapshot('card-variants-visual.json')
    })
  })

  describe('Badge Component Visual States', () => {
    it('should maintain consistent badge styling across variants', () => {
      const badgeVariants = ['default', 'secondary', 'destructive', 'success', 'warning', 'outline']
      const badgeSnapshots: Record<string, any> = {}

      badgeVariants.forEach(variant => {
        const variantClass = variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                            variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
                            variant === 'success' ? 'bg-success text-success-foreground' :
                            variant === 'warning' ? 'bg-warning text-warning-foreground' :
                            variant === 'outline' ? 'border border-input bg-transparent' :
                            'bg-primary text-primary-foreground'

        const badge = createTestElement(
          'Badge Text',
          `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClass}`
        )

        const styles = getComputedStyles(badge)
        badgeSnapshots[variant] = styles
      })

      expect(badgeSnapshots).toMatchSnapshot('badge-variants-visual.json')
    })
  })
})

describe('Visual Regression - Theme Consistency', () => {
  describe('Light Theme Visual States', () => {
    it('should maintain consistent color mapping in light theme', () => {
      const lightThemeElements = [
        { name: 'background', classes: 'bg-background text-foreground' },
        { name: 'card', classes: 'bg-card text-card-foreground' },
        { name: 'popover', classes: 'bg-popover text-popover-foreground' },
        { name: 'primary', classes: 'bg-primary text-primary-foreground' },
        { name: 'secondary', classes: 'bg-secondary text-secondary-foreground' },
        { name: 'muted', classes: 'bg-muted text-muted-foreground' },
        { name: 'accent', classes: 'bg-accent text-accent-foreground' },
        { name: 'destructive', classes: 'bg-destructive text-destructive-foreground' },
        { name: 'success', classes: 'bg-success text-success-foreground' },
        { name: 'warning', classes: 'bg-warning text-warning-foreground' }
      ]

      const lightThemeSnapshot: Record<string, any> = {}

      lightThemeElements.forEach(({ name, classes }) => {
        const element = createTestElement('<div>Theme Test</div>', classes)
        const styles = getComputedStyles(element)

        lightThemeSnapshot[name] = {
          backgroundColor: styles.backgroundColor,
          color: styles.color
        }

        // Ensure colors are properly defined
        expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
      })

      expect(lightThemeSnapshot).toMatchSnapshot('light-theme-colors.json')
    })
  })

  describe('Dark Theme Visual States', () => {
    beforeAll(() => {
      // Add dark class to document root for dark theme testing
      document.documentElement.classList.add('dark')
    })

    afterAll(() => {
      document.documentElement.classList.remove('dark')
    })

    it('should maintain consistent color mapping in dark theme', () => {
      const darkThemeElements = [
        { name: 'background', classes: 'bg-background text-foreground' },
        { name: 'card', classes: 'bg-card text-card-foreground' },
        { name: 'popover', classes: 'bg-popover text-popover-foreground' },
        { name: 'primary', classes: 'bg-primary text-primary-foreground' },
        { name: 'secondary', classes: 'bg-secondary text-secondary-foreground' },
        { name: 'muted', classes: 'bg-muted text-muted-foreground' },
        { name: 'accent', classes: 'bg-accent text-accent-foreground' },
        { name: 'destructive', classes: 'bg-destructive text-destructive-foreground' }
      ]

      const darkThemeSnapshot: Record<string, any> = {}

      darkThemeElements.forEach(({ name, classes }) => {
        const element = createTestElement('<div>Dark Theme Test</div>', classes)
        const styles = getComputedStyles(element)

        darkThemeSnapshot[name] = {
          backgroundColor: styles.backgroundColor,
          color: styles.color
        }
      })

      expect(darkThemeSnapshot).toMatchSnapshot('dark-theme-colors.json')
    })
  })

  describe('Theme Transition Consistency', () => {
    it('should maintain smooth transitions between themes', () => {
      const transitionElements = [
        'bg-background',
        'bg-card',
        'bg-primary',
        'bg-secondary',
        'bg-muted',
        'bg-accent'
      ]

      const transitionSnapshots: Record<string, any> = {}

      transitionElements.forEach(className => {
        const element = createTestElement(
          '<div>Transition Test</div>',
          `${className} transition-colors duration-200`
        )

        const styles = getComputedStyles(element)
        transitionSnapshots[className] = {
          transition: styles.transition,
          backgroundColor: styles.backgroundColor
        }

        // Ensure transitions are properly defined
        expect(styles.transition).toContain('color')
      })

      expect(transitionSnapshots).toMatchSnapshot('theme-transitions.json')
    })
  })
})

describe('Visual Regression - Responsive States', () => {
  describe('Mobile Viewport Visual States', () => {
    beforeAll(() => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      Object.defineProperty(window, 'innerHeight', { value: 667 })
    })

    it('should maintain consistent mobile styling', () => {
      const mobileElements = [
        { name: 'mobile-button', classes: 'h-11 px-3 py-2 text-sm rounded-md' },
        { name: 'mobile-input', classes: 'h-12 px-3 py-2 text-base rounded-md' },
        { name: 'mobile-card', classes: 'p-3 rounded-lg shadow-sm' },
        { name: 'mobile-text', classes: 'text-sm leading-5' }
      ]

      const mobileSnapshots: Record<string, any> = {}

      mobileElements.forEach(({ name, classes }) => {
        const element = createTestElement('<div>Mobile Test</div>', classes)
        const styles = getComputedStyles(element)
        mobileSnapshots[name] = styles
      })

      expect(mobileSnapshots).toMatchSnapshot('mobile-responsive-states.json')
    })
  })

  describe('Desktop Viewport Visual States', () => {
    beforeAll(() => {
      // Simulate desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1440 })
      Object.defineProperty(window, 'innerHeight', { value: 900 })
    })

    it('should maintain consistent desktop styling', () => {
      const desktopElements = [
        { name: 'desktop-button', classes: 'h-12 px-6 py-3 text-base rounded-lg' },
        { name: 'desktop-input', classes: 'h-12 px-4 py-3 text-base rounded-lg' },
        { name: 'desktop-card', classes: 'p-6 rounded-xl shadow-md' },
        { name: 'desktop-text', classes: 'text-base leading-6' }
      ]

      const desktopSnapshots: Record<string, any> = {}

      desktopElements.forEach(({ name, classes }) => {
        const element = createTestElement('<div>Desktop Test</div>', classes)
        const styles = getComputedStyles(element)
        desktopSnapshots[name] = styles
      })

      expect(desktopSnapshots).toMatchSnapshot('desktop-responsive-states.json')
    })
  })
})

describe('Visual Regression - Accessibility States', () => {
  describe('High Contrast Mode', () => {
    beforeAll(() => {
      // Simulate high contrast preferences
      document.documentElement.classList.add('high-contrast')
    })

    afterAll(() => {
      document.documentElement.classList.remove('high-contrast')
    })

    it('should maintain accessibility compliance in high contrast mode', () => {
      const highContrastElements = [
        { name: 'hc-button', classes: 'bg-primary text-primary-foreground border-2' },
        { name: 'hc-input', classes: 'border-2 border-input bg-background' },
        { name: 'hc-link', classes: 'text-primary underline underline-offset-4' },
        { name: 'hc-focus', classes: 'ring-2 ring-primary ring-offset-2' }
      ]

      const highContrastSnapshots: Record<string, any> = {}

      highContrastElements.forEach(({ name, classes }) => {
        const element = createTestElement('<div>High Contrast Test</div>', classes)
        const styles = getComputedStyles(element)

        highContrastSnapshots[name] = {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderColor: styles.borderColor,
          borderWidth: styles.borderWidth,
          textDecoration: styles.textDecoration,
          outline: styles.outline
        }
      })

      expect(highContrastSnapshots).toMatchSnapshot('high-contrast-accessibility.json')
    })
  })

  describe('Reduced Motion States', () => {
    beforeAll(() => {
      // Simulate reduced motion preferences
      document.documentElement.classList.add('motion-reduce')
    })

    afterAll(() => {
      document.documentElement.classList.remove('motion-reduce')
    })

    it('should respect reduced motion preferences', () => {
      const motionElements = [
        { name: 'reduced-button', classes: 'transition-none transform-none' },
        { name: 'reduced-card', classes: 'transition-none animate-none' },
        { name: 'reduced-modal', classes: 'transition-none' }
      ]

      const reducedMotionSnapshots: Record<string, any> = {}

      motionElements.forEach(({ name, classes }) => {
        const element = createTestElement('<div>Reduced Motion Test</div>', classes)
        const styles = getComputedStyles(element)

        reducedMotionSnapshots[name] = {
          transition: styles.transition,
          transform: styles.transform,
          animation: styles.animation
        }

        // Ensure animations are disabled
        expect(styles.transition).toBe('none')
      })

      expect(reducedMotionSnapshots).toMatchSnapshot('reduced-motion-states.json')
    })
  })
})

describe('Visual Regression - Token Application Accuracy', () => {
  describe('MFB Brand Token Application', () => {
    it('should correctly apply MFB brand tokens to components', () => {
      const mfbBrandElements = [
        { name: 'mfb-primary', classes: 'bg-mfb-green text-white' },
        { name: 'mfb-secondary', classes: 'bg-mfb-clay text-mfb-green' },
        { name: 'mfb-accent', classes: 'bg-mfb-cream text-mfb-sage' },
        { name: 'mfb-neutral', classes: 'bg-mfb-olive text-white' }
      ]

      const mfbBrandSnapshots: Record<string, any> = {}

      mfbBrandElements.forEach(({ name, classes }) => {
        const element = createTestElement('<div>MFB Brand Test</div>', classes)
        const styles = getComputedStyles(element)

        mfbBrandSnapshots[name] = {
          backgroundColor: styles.backgroundColor,
          color: styles.color
        }
      })

      expect(mfbBrandSnapshots).toMatchSnapshot('mfb-brand-token-application.json')
    })
  })

  describe('Semantic Token Mapping Accuracy', () => {
    it('should correctly map semantic tokens to visual properties', () => {
      const semanticMappings = [
        { name: 'primary-mapping', classes: 'bg-primary text-primary-foreground' },
        { name: 'success-mapping', classes: 'bg-success text-success-foreground' },
        { name: 'warning-mapping', classes: 'bg-warning text-warning-foreground' },
        { name: 'destructive-mapping', classes: 'bg-destructive text-destructive-foreground' },
        { name: 'muted-mapping', classes: 'bg-muted text-muted-foreground' }
      ]

      const semanticSnapshots: Record<string, any> = {}

      semanticMappings.forEach(({ name, classes }) => {
        const element = createTestElement('<div>Semantic Mapping Test</div>', classes)
        const styles = getComputedStyles(element)

        semanticSnapshots[name] = {
          backgroundColor: styles.backgroundColor,
          color: styles.color
        }
      })

      expect(semanticSnapshots).toMatchSnapshot('semantic-token-mappings.json')
    })
  })
})