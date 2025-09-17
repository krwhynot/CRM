'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getNextTheme = () => {
    if (theme === 'light') return 'dark'
    if (theme === 'dark') return 'system'
    return 'light'
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="size-4" />
    }

    // For light/dark themes, show icon based on resolved theme for visual feedback
    return (
      <>
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </>
    )
  }

  const getAriaLabel = () => {
    const nextTheme = getNextTheme()
    if (theme === 'system') {
      return `Current: system (${resolvedTheme}), switch to ${nextTheme}`
    }
    return `Switch to ${nextTheme} mode`
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="focus-ring"
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
      title={`Current theme: ${theme}${theme === 'system' ? ` (${resolvedTheme})` : ''}`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
