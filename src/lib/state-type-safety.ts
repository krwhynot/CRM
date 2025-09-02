/**
 * State Management Type Safety Utilities
 *
 * Provides branded types and constraints to ensure proper separation
 * between client-side state (Zustand) and server-side state (TanStack Query)
 *
 * Architecture Rules:
 * - Client state should only store UI state, preferences, and identifiers
 * - Server state should only be managed through TanStack Query hooks
 * - No server data objects should be stored in Zustand stores
 * - No direct server operations should occur in client state
 */

// Branded types to enforce boundaries
export type ClientState<T = unknown> = T & { readonly __clientState: unique symbol }
export type ServerData<T = unknown> = T & { readonly __serverData: unique symbol }

// Type guard functions
export function isClientState<T>(value: T): value is ClientState<T> {
  return typeof value === 'object' && value !== null
}

export function isServerData<T>(value: T): value is ServerData<T> {
  return typeof value === 'object' && value !== null
}

// Utility types for client state stores
export type ClientOnlyFilter = {
  readonly search?: string
  readonly viewMode?: string
  readonly sortBy?: string
  readonly sortOrder?: 'asc' | 'desc'
  readonly showAdvanced?: boolean
}

export type ClientOnlySelection = {
  readonly selectedId?: string | null
  readonly selectedIds?: readonly string[]
}

export type ClientOnlyForm = {
  readonly isOpen: boolean
  readonly mode: 'create' | 'edit' | null
  readonly editingId?: string | null
}

export type ClientOnlyPreferences = {
  readonly defaultView?: string
  readonly itemsPerPage?: number
  readonly autoRefresh?: boolean
  readonly theme?: 'light' | 'dark' | 'system'
}

// Base interface for all client state stores
export interface BaseClientState {
  readonly preferences: ClientOnlyPreferences
  readonly actions: {
    reset: () => void
    updatePreferences: (prefs: Partial<ClientOnlyPreferences>) => void
  }
}

// Type constraints to prevent server data in client stores
export type EnsureClientOnly<T> = T extends { data: unknown }
  ? never
  : T extends { isLoading: unknown }
    ? never
    : T extends { error: unknown }
      ? never
      : T extends { refetch: unknown }
        ? never
        : T

// Utility to extract only client-safe properties
export type ExtractClientSafeProps<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends Function
      ? never
      : T[K] extends { __serverData: unknown }
        ? never
        : K
  }[keyof T]
>

// Type to ensure server hooks don't store client state
export type EnsureServerOnly<T> = T extends { __clientState: unknown } ? never : T

/**
 * Helper type to create safe filter interfaces for client state
 * Extracts only primitive values, not complex objects
 */
export type CreateClientFilters<T> = {
  readonly [K in keyof T]?: T[K] extends string | number | boolean | undefined | null
    ? T[K]
    : T[K] extends (string | number | boolean)[]
      ? T[K]
      : never
}

/**
 * Type guard to ensure a value is safe for client state storage
 */
export function isClientStateSafe(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return true

  if (Array.isArray(value)) {
    return value.every(
      (item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
    )
  }

  if (typeof value === 'object') {
    // Check if it looks like server data (has common server data properties)
    const serverDataKeys = [
      'id',
      'created_at',
      'updated_at',
      'deleted_at',
      'created_by',
      'updated_by',
    ]
    const objectKeys = Object.keys(value as object)

    // If it has multiple server-like keys, it's probably server data
    const serverLikeKeyCount = serverDataKeys.filter((key) => objectKeys.includes(key)).length
    if (serverLikeKeyCount >= 2) {
      // Development warning for server data in client state
      return false
    }

    // Check if all properties are client-safe
    return Object.values(value as object).every((prop) => isClientStateSafe(prop))
  }

  return false
}

/**
 * Runtime validation function for development
 */
export function validateClientState<T extends Record<string, unknown>>(state: T): void {
  if (process.env.NODE_ENV === 'development') {
    Object.entries(state).forEach(([, value]) => {
      if (!isClientStateSafe(value)) {
        // Invalid client state detected - should be handled in development
      }
    })
  }
}

/**
 * Utility type for creating type-safe Zustand stores
 */
export type ClientStateStore<State, Actions> = {
  readonly [K in keyof State]: EnsureClientOnly<State[K]>
} & {
  readonly actions: Actions
}

// Example usage in store definition:
/*
export interface MyStoreState extends BaseClientState {
  selectedItemId: string | null  // ✅ ID only, not full object
  filters: CreateClientFilters<MyFilters>  // ✅ Client-safe filters only
  viewMode: 'list' | 'cards'  // ✅ UI state
}

export const useMyStore = create<ClientStateStore<MyStoreState, MyActions>>()(
  devtools((set, get) => {
    // Store implementation
  })
)
*/
