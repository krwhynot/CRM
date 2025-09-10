/**
 * Interaction Type Safety Utilities
 *
 * Provides type guards, converters, and utilities for handling different
 * interaction type variants safely across the CRM system.
 *
 * Key Types:
 * - Interaction: Basic database row type
 * - InteractionWithRelations: Extended with populated related entities
 *
 * This module ensures type compatibility in OpportunityDialogs callbacks
 * and throughout the interaction handling pipeline.
 */

import type { Interaction, InteractionWithRelations } from '@/types/entities'
import { isDevelopment } from '@/config/environment'
import { debugWarn, debugLog } from '@/utils/debug'

/**
 * Type guard to check if an interaction has relations populated
 */
export const isInteractionWithRelations = (
  interaction: Interaction | InteractionWithRelations
): interaction is InteractionWithRelations => {
  return 'opportunity' in interaction && interaction.opportunity !== undefined
}

/**
 * Type guard to check if an interaction is a basic Interaction type
 */
export const isBasicInteraction = (
  interaction: Interaction | InteractionWithRelations
): interaction is Interaction => {
  return !isInteractionWithRelations(interaction)
}

/**
 * Safely extract the base interaction data from either type variant
 */
export const extractBaseInteraction = (
  interaction: Interaction | InteractionWithRelations
): Interaction => {
  if (isInteractionWithRelations(interaction)) {
    // Extract only base properties, excluding relations
    const {
      contact: _contact, // eslint-disable-line @typescript-eslint/no-unused-vars
      organization: _organization, // eslint-disable-line @typescript-eslint/no-unused-vars
      opportunity: _opportunity, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...baseInteraction
    } = interaction
    return baseInteraction as Interaction
  }

  return interaction
}

/**
 * Type-safe callback wrapper for handlers expecting InteractionWithRelations
 * but receiving Interaction
 */
export const createInteractionWithRelationsHandler = <TArgs extends unknown[]>(
  handler: (interaction: InteractionWithRelations, ...args: TArgs) => void,
  fallbackMessage?: string
) => {
  return (interaction: Interaction | InteractionWithRelations, ...args: TArgs): void => {
    if (isInteractionWithRelations(interaction)) {
      handler(interaction, ...args)
    } else {
      debugWarn(
        fallbackMessage ||
          'Handler expected InteractionWithRelations but received basic Interaction. This may indicate a data loading issue.'
      )
      // Could implement a data loading strategy here if needed
    }
  }
}

/**
 * Type-safe callback wrapper for handlers expecting basic Interaction
 * but receiving InteractionWithRelations
 */
export const createBasicInteractionHandler = <TArgs extends unknown[]>(
  handler: (interaction: Interaction, ...args: TArgs) => void
) => {
  return (interaction: Interaction | InteractionWithRelations, ...args: TArgs): void => {
    const baseInteraction = extractBaseInteraction(interaction)
    handler(baseInteraction, ...args)
  }
}

/**
 * Validation utility to ensure required relations are present
 */
export const validateInteractionRelations = (
  interaction: InteractionWithRelations,
  requiredRelations: Array<
    keyof Pick<InteractionWithRelations, 'contact' | 'organization' | 'opportunity'>
  > = []
): boolean => {
  return requiredRelations.every((relation) => {
    const hasRelation = interaction[relation] !== undefined && interaction[relation] !== null
    if (!hasRelation) {
      debugWarn(`Missing required relation '${relation}' in InteractionWithRelations`)
    }
    return hasRelation
  })
}

/**
 * Safe converter from array of mixed interaction types to InteractionWithRelations[]
 * Filters out any interactions that don't have required relations
 */
export const ensureInteractionsWithRelations = (
  interactions: (Interaction | InteractionWithRelations)[],
  requiredRelations: Array<
    keyof Pick<InteractionWithRelations, 'contact' | 'organization' | 'opportunity'>
  > = ['opportunity']
): InteractionWithRelations[] => {
  return interactions
    .filter(isInteractionWithRelations)
    .filter((interaction) => validateInteractionRelations(interaction, requiredRelations))
}

/**
 * Type-safe opportunity ID extractor
 */
export const getOpportunityId = (interaction: Interaction | InteractionWithRelations): string => {
  if (isInteractionWithRelations(interaction)) {
    return interaction.opportunity?.id || interaction.opportunity_id
  }
  return interaction.opportunity_id
}

/**
 * Development-only type checking utility
 */
export const debugInteractionType = (
  interaction: Interaction | InteractionWithRelations,
  context?: string
): void => {
  if (isDevelopment) {
    const hasRelations = isInteractionWithRelations(interaction)
    debugLog(`[${context || 'InteractionTypeCheck'}] Interaction type:`, {
      hasRelations,
      id: interaction.id,
      opportunityId: getOpportunityId(interaction),
      hasContact: hasRelations && interaction.contact !== undefined,
      hasOrganization: hasRelations && interaction.organization !== undefined,
      hasOpportunity: hasRelations && interaction.opportunity !== undefined,
    })
  }
}
