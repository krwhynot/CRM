import { useState, useCallback } from 'react'
import type { Opportunity, InteractionWithRelations } from '@/types/entities'

interface UseOpportunitiesPageStateReturn {
  // Dialog states
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isInteractionDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setIsInteractionDialogOpen: (open: boolean) => void

  // Editing states
  editingOpportunity: Opportunity | null
  setEditingOpportunity: (opportunity: Opportunity | null) => void
  editingInteraction: InteractionWithRelations | null
  setEditingInteraction: (interaction: InteractionWithRelations | null) => void

  // Timeline state
  selectedOpportunityId: string | null
  setSelectedOpportunityId: (id: string | null) => void

  // Combined handlers
  handleEditOpportunity: (opportunity: Opportunity) => void
  handleViewOpportunity: (opportunity: Opportunity) => void
  handleCloseOpportunityDetail: () => void
  handleAddInteraction: () => void
  handleEditInteraction: (interaction: InteractionWithRelations) => void
}

export const useOpportunitiesPageState = (): UseOpportunitiesPageStateReturn => {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false)

  // Editing states
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [editingInteraction, setEditingInteraction] = useState<InteractionWithRelations | null>(
    null
  )

  // Timeline state
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null)

  // Combined handlers
  const handleEditOpportunity = useCallback((opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setIsEditDialogOpen(true)
  }, [])

  const handleViewOpportunity = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunityId(opportunity.id)
  }, [])

  const handleCloseOpportunityDetail = useCallback(() => {
    setSelectedOpportunityId(null)
    setIsInteractionDialogOpen(false)
    setEditingInteraction(null)
  }, [])

  const handleAddInteraction = useCallback(() => {
    setEditingInteraction(null)
    setIsInteractionDialogOpen(true)
  }, [])

  const handleEditInteraction = useCallback((interaction: InteractionWithRelations) => {
    setEditingInteraction(interaction)
    setIsInteractionDialogOpen(true)
  }, [])

  return {
    // Dialog states
    isCreateDialogOpen,
    isEditDialogOpen,
    isInteractionDialogOpen,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsInteractionDialogOpen,

    // Editing states
    editingOpportunity,
    setEditingOpportunity,
    editingInteraction,
    setEditingInteraction,

    // Timeline state
    selectedOpportunityId,
    setSelectedOpportunityId,

    // Combined handlers
    handleEditOpportunity,
    handleViewOpportunity,
    handleCloseOpportunityDetail,
    handleAddInteraction,
    handleEditInteraction,
  }
}
