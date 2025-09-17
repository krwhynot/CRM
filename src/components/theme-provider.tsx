'use client'

import * as React from 'react'
import { ThemeProviderContext, type Theme } from '@/contexts/ThemeContext'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  enableSystem = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<Theme>('light')

  // Calculate the resolved theme (what's actually applied)
  const getResolvedTheme = React.useCallback(() => {
    if (theme === 'system' && enableSystem) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme, enableSystem])

  // Apply theme classes to DOM
  React.useEffect(() => {
    const root = window.document.documentElement
    const actualTheme = getResolvedTheme()

    // Remove all theme classes
    root.classList.remove('light', 'dark')

    // Apply theme class to document.documentElement for proper CSS variable cascade
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    }
    // Note: For light theme, we don't add a class (default state)
    // This follows the CSS convention where no class = light mode

    setResolvedTheme(actualTheme)
  }, [theme, enableSystem, getResolvedTheme])

  // Listen for system theme changes when in system mode
  React.useEffect(() => {
    if (theme !== 'system' || !enableSystem) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      const actualTheme = getResolvedTheme()
      const root = window.document.documentElement

      root.classList.remove('light', 'dark')
      if (actualTheme === 'dark') {
        root.classList.add('dark')
      }

      setResolvedTheme(actualTheme)
    }

    // Listen for changes in system preference
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, enableSystem, getResolvedTheme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => {
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}
