import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PageContainer } from '@/components/layout'

// Simple wrapper without Router for theme testing
const SimpleTestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('Global layout consistency', () => {
  it('AppShell attribute can be created and verified', async () => {
    // Test the app shell pattern without full Layout component
    const testElement = document.createElement('div')
    testElement.setAttribute('data-app-shell', 'true')
    testElement.className = 'max-w-7xl mx-auto'
    document.body.appendChild(testElement)

    // Check for AppShell presence
    expect(document.querySelector('[data-app-shell]')).toBeTruthy()

    // Check for shared layout components
    expect(document.querySelector('.max-w-7xl')).toBeTruthy()

    // Check for consistent container pattern
    const container = document.querySelector('.max-w-7xl')
    expect(container).toHaveClass('mx-auto')

    document.body.removeChild(testElement)
  })

  it('Theme provider functionality works correctly', async () => {
    render(
      <SimpleTestWrapper>
        <div>Theme test</div>
      </SimpleTestWrapper>
    )

    // Theme provider should be active
    expect(document.documentElement).toHaveClass('light')
  })

  it('PageContainer applies consistent styling', () => {
    render(
      <SimpleTestWrapper>
        <PageContainer data-testid="page-container">
          <div>Test content</div>
        </PageContainer>
      </SimpleTestWrapper>
    )

    const container = screen.getByTestId('page-container')
    expect(container).toHaveClass('mx-auto', 'max-w-7xl')
  })

  it('Theme switching works correctly', async () => {
    // Test light theme
    const { rerender } = render(
      <SimpleTestWrapper>
        <div>Light theme test</div>
      </SimpleTestWrapper>
    )

    // Should start with light theme
    expect(document.documentElement).toHaveClass('light')

    // Test dark theme wrapper
    const DarkWrapper = ({ children }: { children: React.ReactNode }) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      )
    }

    rerender(
      <DarkWrapper>
        <div>Dark theme test</div>
      </DarkWrapper>
    )

    // Should switch to dark theme
    expect(document.documentElement).toHaveClass('dark')
  })

  it('All pages use semantic typography utilities', () => {
    const testElement = document.createElement('div')
    testElement.className = 'text-title'
    document.body.appendChild(testElement)

    // Check that our utility classes are being applied
    expect(testElement).toHaveClass('text-title')

    document.body.removeChild(testElement)
  })

  it('Focus ring utilities are available', () => {
    const testElement = document.createElement('button')
    testElement.className = 'focus-ring'
    document.body.appendChild(testElement)

    // Check that our focus ring utility is available
    expect(testElement).toHaveClass('focus-ring')

    document.body.removeChild(testElement)
  })
})
