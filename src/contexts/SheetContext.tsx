import React, { createContext, useContext } from 'react'

/**
 * SheetContext - Provides sheet state information to child components
 *
 * Allows components to adapt their behavior based on whether they're
 * rendered inside a sheet or as a standalone page.
 */

// Sheet size configuration
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl'

// Sheet side configuration
export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

// Context value interface
export interface SheetContextValue {
  isInSheet: boolean
  size: SheetSize
  side: SheetSide
  onClose?: () => void
}

// Default context value (not in sheet)
const defaultContextValue: SheetContextValue = {
  isInSheet: false,
  size: 'md',
  side: 'right',
}

// Create context
const SheetContext = createContext<SheetContextValue>(defaultContextValue)

/**
 * SheetContextProvider - Context provider component
 *
 * @example
 * <SheetContextProvider isInSheet={true} size="lg" side="right" onClose={handleClose}>
 *   <FilterCard>
 *     <ContactsFilters />
 *   </FilterCard>
 * </SheetContextProvider>
 */
interface SheetContextProviderProps {
  children: React.ReactNode
  isInSheet?: boolean
  size?: SheetSize
  side?: SheetSide
  onClose?: () => void
}

export function SheetContextProvider({
  children,
  isInSheet = false,
  size = 'md',
  side = 'right',
  onClose,
}: SheetContextProviderProps) {
  const contextValue: SheetContextValue = {
    isInSheet,
    size,
    side,
    onClose,
  }

  return <SheetContext.Provider value={contextValue}>{children}</SheetContext.Provider>
}

/**
 * useSheetContext - Hook to access sheet context
 *
 * @returns SheetContextValue with current sheet state
 *
 * @example
 * function MyFilterComponent() {
 *   const { isInSheet, size, side } = useSheetContext()
 *
 *   return (
 *     <div className={isInSheet ? 'p-4' : 'p-8'}>
 *       Content adapts to sheet context
 *     </div>
 *   )
 * }
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSheetContext(): SheetContextValue {
  const context = useContext(SheetContext)

  // Context is always available with default values, so no null check needed
  return context
}

/**
 * withSheetContext - HOC to provide sheet context to components
 *
 * @param Component - Component to wrap with sheet context
 * @param contextProps - Sheet context props
 * @returns Component wrapped with SheetContextProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function withSheetContext<T extends object>(
  Component: React.ComponentType<T>,
  contextProps: Omit<SheetContextProviderProps, 'children'>
) {
  return function WrappedComponent(props: T) {
    return (
      <SheetContextProvider {...contextProps}>
        <Component {...props} />
      </SheetContextProvider>
    )
  }
}

// Export context for advanced usage
export { SheetContext }
