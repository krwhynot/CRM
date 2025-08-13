/**
 * Relationship Progression Store
 * Partnership-focused relationship milestone and progression tracking
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/config/supabase'
import type {
  RelationshipProgression,
  RelationshipProgressionInsert,
  RelationshipProgressionUpdate,
  RelationshipMilestone,
  RelationshipMilestoneInsert,
  TrustActivityRecord,
  TrustActivityInsert,
  CommunicationPattern,
  RelationshipHealthSnapshot,
  RelationshipHealthSnapshotInsert,
  RelationshipOverview,
  RelationshipAnalytics,
  RelationshipStage,
  ProgressionMilestone,
  TrustActivity,
  MilestoneProgressionTimeline,
  ProgressionMetrics
} from '@/types/relationshipProgression.types'

interface RelationshipProgressionState {
  // Core data
  progressions: RelationshipProgression[]
  milestones: RelationshipMilestone[]
  trustActivities: TrustActivityRecord[]
  healthSnapshots: RelationshipHealthSnapshot[]
  communicationPatterns: CommunicationPattern[]
  
  // UI State
  loading: boolean
  error: string | null
  selectedProgressionId: string | null
  
  // Cache and pagination
  currentPage: number
  itemsPerPage: number
  totalCount: number
  hasNextPage: boolean
}

export const useRelationshipProgressionStore = defineStore('relationshipProgression', () => {
  // ============================================================================
  // State
  // ============================================================================
  
  const state = ref<RelationshipProgressionState>({
    progressions: [],
    milestones: [],
    trustActivities: [],
    healthSnapshots: [],
    communicationPatterns: [],
    loading: false,
    error: null,
    selectedProgressionId: null,
    currentPage: 1,
    itemsPerPage: 20,
    totalCount: 0,
    hasNextPage: false
  })

  // ============================================================================
  // Getters
  // ============================================================================
  
  const progressions = computed(() => state.value.progressions)
  const milestones = computed(() => state.value.milestones)
  const trustActivities = computed(() => state.value.trustActivities)
  const healthSnapshots = computed(() => state.value.healthSnapshots)
  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)
  
  const selectedProgression = computed(() => {
    if (!state.value.selectedProgressionId) return null
    return state.value.progressions.find(p => p.id === state.value.selectedProgressionId) || null
  })
  
  // Get progression by organization ID
  const getProgressionByOrganization = computed(() => {
    return (organizationId: string) => {
      return state.value.progressions.find(p => p.organization_id === organizationId)
    }
  })
  
  // Get milestones for a progression
  const getMilestonesForProgression = computed(() => {
    return (progressionId: string) => {
      return state.value.milestones
        .filter(m => m.relationship_progression_id === progressionId)
        .sort((a, b) => new Date(a.achieved_date).getTime() - new Date(b.achieved_date).getTime())
    }
  })
  
  // Get trust activities for a progression
  const getTrustActivitiesForProgression = computed(() => {
    return (progressionId: string) => {
      return state.value.trustActivities
        .filter(t => t.relationship_progression_id === progressionId)
        .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
    }
  })
  
  // Get latest health snapshot for a progression
  const getLatestHealthSnapshot = computed(() => {
    return (progressionId: string) => {
      return state.value.healthSnapshots
        .filter(h => h.relationship_progression_id === progressionId)
        .sort((a, b) => new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime())[0] || null
    }
  })
  
  // Get progressions by stage
  const getProgressionsByStage = computed(() => {
    return (stage: RelationshipStage) => {
      return state.value.progressions.filter(p => p.current_stage === stage)
    }
  })
  
  // Get top performing relationships
  const getTopPerformingRelationships = computed(() => {
    return (limit = 10) => {
      return [...state.value.progressions]
        .sort((a, b) => b.relationship_maturity_score - a.relationship_maturity_score)
        .slice(0, limit)
    }
  })
  
  // Get at-risk relationships
  const getAtRiskRelationships = computed(() => {
    return (limit = 10) => {
      return state.value.progressions
        .filter(p => {
          const lastSnapshot = getLatestHealthSnapshot.value(p.id)
          return lastSnapshot && lastSnapshot.overall_health_score < 60
        })
        .sort((a, b) => {
          const aSnapshot = getLatestHealthSnapshot.value(a.id)
          const bSnapshot = getLatestHealthSnapshot.value(b.id)
          return (aSnapshot?.overall_health_score || 0) - (bSnapshot?.overall_health_score || 0)
        })
        .slice(0, limit)
    }
  })
  
  // Calculate overall metrics
  const progressionMetrics = computed((): ProgressionMetrics => {
    const total = state.value.progressions.length
    const byStage = state.value.progressions.reduce((acc, p) => {
      acc[p.current_stage] = (acc[p.current_stage] || 0) + 1
      return acc
    }, {} as Record<RelationshipStage, number>)
    
    const avgMaturityScore = total > 0 
      ? state.value.progressions.reduce((sum, p) => sum + p.relationship_maturity_score, 0) / total 
      : 0
    
    // Calculate average time to partnership (simplified)
    const partnershipsEstablished = state.value.progressions.filter(p => 
      p.current_stage === 'strategic_collaboration'
    )
    const avgTimeToPartnership = partnershipsEstablished.length > 0
      ? partnershipsEstablished.reduce((sum, p) => {
          if (p.first_contact_date && p.last_milestone_date) {
            const days = (new Date(p.last_milestone_date).getTime() - new Date(p.first_contact_date).getTime()) / (1000 * 60 * 60 * 24)
            return sum + days
          }
          return sum
        }, 0) / partnershipsEstablished.length
      : 0
    
    return {
      total_relationships: total,
      by_stage: byStage,
      avg_maturity_score: Math.round(avgMaturityScore),
      avg_time_to_partnership: Math.round(avgTimeToPartnership),
      top_performing_relationships: getTopPerformingRelationships.value(5) as RelationshipOverview[],
      at_risk_relationships: getAtRiskRelationships.value(5) as RelationshipOverview[]
    }
  })

  // ============================================================================
  // Actions
  // ============================================================================
  
  async function fetchProgressions() {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { data, error } = await supabase
        .from('relationship_progressions')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      state.value.progressions = data || []
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch relationship progressions'
      console.error('Error fetching progressions:', err)
    } finally {
      state.value.loading = false
    }
  }
  
  async function fetchProgressionById(id: string) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { data, error } = await supabase
        .from('relationship_progressions')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      // Update existing progression or add new one
      const existingIndex = state.value.progressions.findIndex(p => p.id === id)
      if (existingIndex >= 0) {
        state.value.progressions[existingIndex] = data
      } else {
        state.value.progressions.push(data)
      }
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch relationship progression'
      console.error('Error fetching progression:', err)
    } finally {
      state.value.loading = false
    }
  }
  
  async function fetchProgressionByOrganization(organizationId: string) {
    try {
      const { data, error } = await supabase
        .from('relationship_progressions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
      
      if (data) {
        // Update existing progression or add new one
        const existingIndex = state.value.progressions.findIndex(p => p.id === data.id)
        if (existingIndex >= 0) {
          state.value.progressions[existingIndex] = data
        } else {
          state.value.progressions.push(data)
        }
      }
      
      return data
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch progression by organization'
      console.error('Error fetching progression by organization:', err)
      return null
    }
  }
  
  async function createProgression(progressionData: RelationshipProgressionInsert) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { data, error } = await supabase
        .from('relationship_progressions')
        .insert(progressionData)
        .select()
        .single()
      
      if (error) throw error
      
      state.value.progressions.push(data)
      return data
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to create relationship progression'
      console.error('Error creating progression:', err)
      return null
    } finally {
      state.value.loading = false
    }
  }
  
  async function updateProgression(id: string, updates: RelationshipProgressionUpdate) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { data, error } = await supabase
        .from('relationship_progressions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      const index = state.value.progressions.findIndex(p => p.id === id)
      if (index >= 0) {
        state.value.progressions[index] = data
      }
      
      return data
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to update relationship progression'
      console.error('Error updating progression:', err)
      return null
    } finally {
      state.value.loading = false
    }
  }
  
  async function deleteProgression(id: string) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { error } = await supabase
        .from('relationship_progressions')
        .update({ is_active: false })
        .eq('id', id)
      
      if (error) throw error
      
      // Remove from state
      state.value.progressions = state.value.progressions.filter(p => p.id !== id)
      
      // Clear selection if deleted item was selected
      if (state.value.selectedProgressionId === id) {
        state.value.selectedProgressionId = null
      }
      
      return true
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to delete relationship progression'
      console.error('Error deleting progression:', err)
      return false
    } finally {
      state.value.loading = false
    }
  }

  // ============================================================================
  // Milestone Management
  // ============================================================================
  
  async function fetchMilestonesForProgression(progressionId: string) {
    try {
      const { data, error } = await supabase
        .from('relationship_milestones')
        .select('*')
        .eq('relationship_progression_id', progressionId)
        .order('achieved_date', { ascending: false })
      
      if (error) throw error
      
      // Update milestones in state
      const existingMilestones = state.value.milestones.filter(m => m.relationship_progression_id !== progressionId)
      state.value.milestones = [...existingMilestones, ...(data || [])]
      
      return data || []
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch milestones'
      console.error('Error fetching milestones:', err)
      return []
    }
  }
  
  async function addMilestone(milestoneData: RelationshipMilestoneInsert) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { data, error } = await supabase
        .from('relationship_milestones')
        .insert(milestoneData)
        .select()
        .single()
      
      if (error) throw error
      
      state.value.milestones.push(data)
      
      // Refresh the related progression to get updated scores
      await fetchProgressionById(milestoneData.relationship_progression_id)
      
      return data
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to add milestone'
      console.error('Error adding milestone:', err)
      return null
    } finally {
      state.value.loading = false
    }
  }
  
  async function removeMilestone(milestoneId: string) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const milestone = state.value.milestones.find(m => m.id === milestoneId)
      if (!milestone) throw new Error('Milestone not found')
      
      const { error } = await supabase
        .from('relationship_milestones')
        .delete()
        .eq('id', milestoneId)
      
      if (error) throw error
      
      state.value.milestones = state.value.milestones.filter(m => m.id !== milestoneId)
      
      // Refresh the related progression to get updated scores
      await fetchProgressionById(milestone.relationship_progression_id)
      
      return true
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to remove milestone'
      console.error('Error removing milestone:', err)
      return false
    } finally {
      state.value.loading = false
    }
  }

  // ============================================================================
  // Trust Activity Management
  // ============================================================================
  
  async function fetchTrustActivitiesForProgression(progressionId: string) {
    try {
      const { data, error } = await supabase
        .from('trust_activities')
        .select('*')
        .eq('relationship_progression_id', progressionId)
        .order('activity_date', { ascending: false })
      
      if (error) throw error
      
      // Update trust activities in state
      const existingActivities = state.value.trustActivities.filter(t => t.relationship_progression_id !== progressionId)
      state.value.trustActivities = [...existingActivities, ...(data || [])]
      
      return data || []
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch trust activities'
      console.error('Error fetching trust activities:', err)
      return []
    }
  }
  
  async function addTrustActivity(activityData: TrustActivityInsert) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { data, error } = await supabase
        .from('trust_activities')
        .insert(activityData)
        .select()
        .single()
      
      if (error) throw error
      
      state.value.trustActivities.push(data)
      
      // Refresh the related progression to get updated scores
      await fetchProgressionById(activityData.relationship_progression_id)
      
      return data
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to add trust activity'
      console.error('Error adding trust activity:', err)
      return null
    } finally {
      state.value.loading = false
    }
  }

  // ============================================================================
  // Health Assessment Management
  // ============================================================================
  
  async function fetchHealthSnapshotsForProgression(progressionId: string) {
    try {
      const { data, error } = await supabase
        .from('relationship_health_snapshots')
        .select('*')
        .eq('relationship_progression_id', progressionId)
        .order('snapshot_date', { ascending: false })
      
      if (error) throw error
      
      // Update health snapshots in state
      const existingSnapshots = state.value.healthSnapshots.filter(h => h.relationship_progression_id !== progressionId)
      state.value.healthSnapshots = [...existingSnapshots, ...(data || [])]
      
      return data || []
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch health snapshots'
      console.error('Error fetching health snapshots:', err)
      return []
    }
  }
  
  async function addHealthSnapshot(snapshotData: RelationshipHealthSnapshotInsert) {
    state.value.loading = true
    state.value.error = null
    
    try {
      const { data, error } = await supabase
        .from('relationship_health_snapshots')
        .insert(snapshotData)
        .select()
        .single()
      
      if (error) throw error
      
      state.value.healthSnapshots.push(data)
      return data
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to add health snapshot'
      console.error('Error adding health snapshot:', err)
      return null
    } finally {
      state.value.loading = false
    }
  }

  // ============================================================================
  // Analytics and Views
  // ============================================================================
  
  async function fetchRelationshipOverview(): Promise<RelationshipOverview[]> {
    try {
      const { data, error } = await supabase
        .from('relationship_overview')
        .select('*')
        .order('relationship_maturity_score', { ascending: false })
      
      if (error) throw error
      
      return data || []
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch relationship overview'
      console.error('Error fetching relationship overview:', err)
      return []
    }
  }
  
  async function fetchMilestoneTimeline(progressionId: string): Promise<MilestoneProgressionTimeline[]> {
    try {
      const { data, error } = await supabase
        .from('milestone_progression_timeline')
        .select('*')
        .eq('relationship_progression_id', progressionId)
        .order('achieved_date', { ascending: true })
      
      if (error) throw error
      
      return data || []
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to fetch milestone timeline'
      console.error('Error fetching milestone timeline:', err)
      return []
    }
  }
  
  async function generateRelationshipAnalytics(organizationId: string): Promise<RelationshipAnalytics | null> {
    try {
      const progression = await fetchProgressionByOrganization(organizationId)
      if (!progression) return null
      
      const milestones = await fetchMilestonesForProgression(progression.id)
      const healthSnapshot = getLatestHealthSnapshot.value(progression.id)
      
      // Calculate progression velocity (milestones per month)
      const firstContactDate = progression.first_contact_date ? new Date(progression.first_contact_date) : new Date()
      const monthsSinceFirst = (Date.now() - firstContactDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      const progressionVelocity = monthsSinceFirst > 0 ? milestones.length / monthsSinceFirst : 0
      
      // Determine trends (simplified)
      const healthTrend = healthSnapshot?.overall_health_score >= 70 ? 'improving' : 
                        healthSnapshot?.overall_health_score >= 50 ? 'stable' : 'declining'
      
      return {
        organization_id: organizationId,
        organization_name: 'Organization Name', // Would be fetched from organizations
        current_stage: progression.current_stage,
        overall_health_score: healthSnapshot?.overall_health_score || 0,
        maturity_score: progression.relationship_maturity_score,
        trust_level: progression.trust_level_score,
        milestones_achieved: milestones.length,
        days_in_current_stage: 0, // Would calculate based on stage transition history
        progression_velocity: Math.round(progressionVelocity * 100) / 100,
        health_trend,
        engagement_trend: 'stable', // Would calculate based on interaction patterns
        risk_level: healthSnapshot?.risk_level || 1,
        primary_risks: healthSnapshot?.risk_factors || [],
        growth_opportunities: progression.growth_opportunities?.split(',') || [],
        recommended_next_actions: healthSnapshot?.recommended_actions || []
      } as RelationshipAnalytics
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Failed to generate relationship analytics'
      console.error('Error generating analytics:', err)
      return null
    }
  }

  // ============================================================================
  // UI Actions
  // ============================================================================
  
  function setSelectedProgression(progressionId: string | null) {
    state.value.selectedProgressionId = progressionId
  }
  
  function clearError() {
    state.value.error = null
  }
  
  function resetStore() {
    state.value.progressions = []
    state.value.milestones = []
    state.value.trustActivities = []
    state.value.healthSnapshots = []
    state.value.communicationPatterns = []
    state.value.loading = false
    state.value.error = null
    state.value.selectedProgressionId = null
    state.value.currentPage = 1
    state.value.totalCount = 0
    state.value.hasNextPage = false
  }

  // ============================================================================
  // Auto-initialization for existing organizations
  // ============================================================================
  
  async function ensureProgressionExists(organizationId: string): Promise<RelationshipProgression | null> {
    try {
      // Check if progression already exists
      let progression = await fetchProgressionByOrganization(organizationId)
      
      if (!progression) {
        // Create new progression with default values
        const newProgressionData: RelationshipProgressionInsert = {
          organization_id: organizationId,
          current_stage: 'initial_contact',
          relationship_maturity_score: 0,
          trust_level_score: 0,
          communication_frequency_score: 0,
          stakeholder_engagement_score: 0,
          product_portfolio_depth_score: 0,
          partnership_resilience_score: 0,
          strategic_value_score: 0,
          total_interactions_count: 0,
          response_quality: 'minimal',
          contacts_engaged_count: 0,
          decision_makers_engaged_count: 0,
          products_discussed_count: 0,
          product_categories_engaged: 0,
          is_active: true,
          first_contact_date: new Date().toISOString()
        }
        
        progression = await createProgression(newProgressionData)
      }
      
      return progression
    } catch (err) {
      console.error('Error ensuring progression exists:', err)
      return null
    }
  }

  return {
    // State
    state,
    
    // Getters
    progressions,
    milestones,
    trustActivities,
    healthSnapshots,
    loading,
    error,
    selectedProgression,
    getProgressionByOrganization,
    getMilestonesForProgression,
    getTrustActivitiesForProgression,
    getLatestHealthSnapshot,
    getProgressionsByStage,
    getTopPerformingRelationships,
    getAtRiskRelationships,
    progressionMetrics,
    
    // Actions
    fetchProgressions,
    fetchProgressionById,
    fetchProgressionByOrganization,
    createProgression,
    updateProgression,
    deleteProgression,
    fetchMilestonesForProgression,
    addMilestone,
    removeMilestone,
    fetchTrustActivitiesForProgression,
    addTrustActivity,
    fetchHealthSnapshotsForProgression,
    addHealthSnapshot,
    fetchRelationshipOverview,
    fetchMilestoneTimeline,
    generateRelationshipAnalytics,
    ensureProgressionExists,
    
    // UI Actions
    setSelectedProgression,
    clearError,
    resetStore
  }
})