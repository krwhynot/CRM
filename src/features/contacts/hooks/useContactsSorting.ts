/**
 * Contact sorting hook - simplified implementation for build compatibility
 */
export function useContactsSorting<T>(contacts: T[]) {
  return {
    sortedContacts: contacts,
    setSortBy: () => {},
    sortBy: 'name' as const,
    sortDirection: 'asc' as const,
  }
}
