import { useMemo } from 'react'
import type { InteractionWithRelations, InteractionFormData } from '@/types/interaction.types'

export function useInteractionFormData(interaction: InteractionWithRelations | null) {
  const initialData = useMemo((): InteractionFormData | undefined => {
    if (!interaction) return undefined

    return {
      type: interaction.type,
      interaction_date: interaction.interaction_date,
      subject: interaction.subject || '',
      description: interaction.description || undefined,
      notes: interaction.notes || undefined,
      duration_minutes: interaction.duration_minutes || undefined,
      location: interaction.location || undefined,
      outcome: interaction.outcome || undefined,
      follow_up_required: interaction.follow_up_required || false,
      follow_up_date: interaction.follow_up_date || undefined,
      follow_up_notes: interaction.follow_up_notes || undefined,
      opportunity_id: interaction.opportunity_id,
      contact_id: interaction.contact_id || undefined,
      organization_id: interaction.organization_id || undefined,
    }
  }, [interaction])

  return {
    initialData,
  }
}