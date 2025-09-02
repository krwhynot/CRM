import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Hook to get navigation-specific counts and warnings
export function useNavigationCounts() {
  return useQuery({
    queryKey: ['navigation-counts'],
    queryFn: async () => {
      // Get principal organizations count
      const { data: principals, error: principalsError } = await supabase
        .from('organizations')
        .select('id', { count: 'exact' })
        .eq('type', 'principal')
        .is('deleted_at', null)

      if (principalsError) throw principalsError

      // Get organizations without contacts
      const { data: orgsWithoutContacts, error: orgsError } = await supabase
        .from('organizations')
        .select(
          `
          id,
          name,
          contacts!inner(id)
        `
        )
        .is('deleted_at', null)
        .is('contacts.deleted_at', null)

      if (orgsError && orgsError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for a count query
        throw orgsError
      }

      // Get all organizations to compare
      const { data: allOrgs, error: allOrgsError } = await supabase
        .from('organizations')
        .select('id')
        .is('deleted_at', null)

      if (allOrgsError) throw allOrgsError

      // Calculate organizations without contacts
      const orgsWithContacts = new Set(orgsWithoutContacts?.map((org) => org.id) || [])
      const orgsWithoutContactsCount = allOrgs.length - orgsWithContacts.size

      return {
        principalsCount: principals?.length || 0,
        organizationsWithoutContactsCount: orgsWithoutContactsCount,
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}
