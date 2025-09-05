import React, { createContext, useContext } from 'react'

/**
 * DialogContext - Provides dialog state information to child components
 *
 * Allows form components to adapt their behavior based on whether they're
 * rendered inside a dialog or as a standalone page.
 */

// Dialog size configuration
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl'

// Context value interface
export interface DialogContextValue {
  isInDialog: boolean
  size: DialogSize
  onClose?: () => void
}

// Default context value (not in dialog)
const defaultContextValue: DialogContextValue = {
  isInDialog: false,
  size: 'md',
}

// Create context
const DialogContext = createContext<DialogContextValue>(defaultContextValue)

/**
 * DialogContextProvider - Context provider component
 *
 * @example
 * <DialogContextProvider isInDialog={true} size="lg" onClose={handleClose}>
 *   <FormCard>
 *     <ContactForm />
 *   </FormCard>
 * </DialogContextProvider>
 */
interface DialogContextProviderProps {
  children: React.ReactNode
  isInDialog?: boolean
  size?: DialogSize
  onClose?: () => void
}

export function DialogContextProvider({
  children,
  isInDialog = false,
  size = 'md',
  onClose,
}: DialogContextProviderProps) {
  const contextValue: DialogContextValue = {
    isInDialog,
    size,
    onClose,
  }

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>
}

/**
 * useDialogContext - Hook to access dialog context
 *
 * @returns DialogContextValue with current dialog state
 *
 * @example
 * function MyFormComponent() {
 *   const { isInDialog, size } = useDialogContext()
 *
 *   return (
 *     <div className={isInDialog ? 'p-4' : 'p-8'}>
 *       Content adapts to dialog context
 *     </div>
 *   )
 * }
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useDialogContext(): DialogContextValue {
  const context = useContext(DialogContext)

  // Context is always available with default values, so no null check needed
  return context
}

/**
 * withDialogContext - HOC to provide dialog context to components
 *
 * @param Component - Component to wrap with dialog context
 * @param contextProps - Dialog context props
 * @returns Component wrapped with DialogContextProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function withDialogContext<T extends object>(
  Component: React.ComponentType<T>,
  contextProps: Omit<DialogContextProviderProps, 'children'>
) {
  return function WrappedComponent(props: T) {
    return (
      <DialogContextProvider {...contextProps}>
        <Component {...props} />
      </DialogContextProvider>
    )
  }
}

// Export context for advanced usage
export { DialogContext }
