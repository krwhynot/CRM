/**
 * Static Data Cache Hook
 *
 * React hook for accessing cached static data with automatic loading states
 * and error handling. Provides consistent interface for all static data types.
 */

import { useState, useEffect, useCallback } from 'react'
import { staticDataCache } from '@/lib/cache'
import type { Database } from '@/lib/database.types'

// Lookup table types
type InteractionType = Database['public']['Tables']['interaction_type_lu']['Row']
type Stage = Database['public']['Tables']['stage_lu']['Row']
type Status = Database['public']['Tables']['status_lu']['Row']
type LossReason = Database['public']['Tables']['loss_reason_lu']['Row']
type Source = Database['public']['Tables']['source_lu']['Row']
type StaticOption = { value: string; label: string }

// Generic hook state
interface CacheHookState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Individual hooks for each data type
export function useInteractionTypes() {
  const [state, setState] = useState<CacheHookState<InteractionType[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const data = await staticDataCache.getInteractionTypes()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load interaction types',
      })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

export function useStages() {
  const [state, setState] = useState<CacheHookState<Stage[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const data = await staticDataCache.getStages()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load stages',
      })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

export function useStatuses() {
  const [state, setState] = useState<CacheHookState<Status[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const data = await staticDataCache.getStatuses()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load statuses',
      })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

export function useLossReasons() {
  const [state, setState] = useState<CacheHookState<LossReason[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const data = await staticDataCache.getLossReasons()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load loss reasons',
      })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

export function useSources() {
  const [state, setState] = useState<CacheHookState<Source[]>>({
    data: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const data = await staticDataCache.getSources()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load sources',
      })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

// Static data hooks (instant access)
export function useOrganizationTypes() {
  const [data] = useState(() => staticDataCache.getOrganizationTypes())
  return { data, loading: false, error: null }
}

export function usePriorityLevels() {
  const [data] = useState(() => staticDataCache.getPriorityLevels())
  return { data, loading: false, error: null }
}

export function useContactRoles() {
  const [data] = useState(() => staticDataCache.getContactRoles())
  return { data, loading: false, error: null }
}

export function useFoodServiceSegments() {
  const [data] = useState(() => staticDataCache.getFoodServiceSegments())
  return { data, loading: false, error: null }
}

// Combined hook for all static data
export function useAllStaticData() {
  const interactionTypes = useInteractionTypes()
  const stages = useStages()
  const statuses = useStatuses()
  const lossReasons = useLossReasons()
  const sources = useSources()
  const organizationTypes = useOrganizationTypes()
  const priorityLevels = usePriorityLevels()
  const contactRoles = useContactRoles()
  const foodServiceSegments = useFoodServiceSegments()

  const loading =
    interactionTypes.loading ||
    stages.loading ||
    statuses.loading ||
    lossReasons.loading ||
    sources.loading

  const error =
    interactionTypes.error || stages.error || statuses.error || lossReasons.error || sources.error

  const reload = useCallback(() => {
    interactionTypes.reload?.()
    stages.reload?.()
    statuses.reload?.()
    lossReasons.reload?.()
    sources.reload?.()
  }, [interactionTypes.reload, stages.reload, statuses.reload, lossReasons.reload, sources.reload])

  return {
    data: {
      interactionTypes: interactionTypes.data,
      stages: stages.data,
      statuses: statuses.data,
      lossReasons: lossReasons.data,
      sources: sources.data,
      organizationTypes: organizationTypes.data,
      priorityLevels: priorityLevels.data,
      contactRoles: contactRoles.data,
      foodServiceSegments: foodServiceSegments.data,
    },
    loading,
    error,
    reload,
  }
}

// Cache management hook
export function useCacheManagement() {
  const [metrics, setMetrics] = useState(staticDataCache.getMetrics())

  const updateMetrics = useCallback(() => {
    setMetrics(staticDataCache.getMetrics())
  }, [])

  const clearCache = useCallback(() => {
    staticDataCache.clearCache()
    updateMetrics()
  }, [updateMetrics])

  const warmCache = useCallback(async () => {
    await staticDataCache.warmCache()
    updateMetrics()
  }, [updateMetrics])

  // Auto-update metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(updateMetrics, 30000)
    return () => clearInterval(interval)
  }, [updateMetrics])

  return {
    metrics,
    clearCache,
    warmCache,
    updateMetrics,
  }
}

// Cache warming hook for app initialization
export function useCacheWarming() {
  const [isWarming, setIsWarming] = useState(false)
  const [isWarmed, setIsWarmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const warmCache = useCallback(async () => {
    if (isWarming || isWarmed) return

    setIsWarming(true)
    setError(null)

    try {
      await staticDataCache.warmCache()
      setIsWarmed(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to warm cache')
    } finally {
      setIsWarming(false)
    }
  }, [isWarming, isWarmed])

  // Auto-warm cache on mount
  useEffect(() => {
    warmCache()
  }, [warmCache])

  return {
    isWarming,
    isWarmed,
    error,
    warmCache,
  }
}
