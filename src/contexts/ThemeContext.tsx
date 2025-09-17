import * as React from 'react'

export type Theme = 'dark' | 'light' | 'system'

export type ThemeProviderState = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
}

export const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}