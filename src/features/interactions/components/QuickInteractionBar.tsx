// Removed unused: import React from 'react'
// Enhanced quick interaction bar with priority, account manager, and multiple principal support
import { EnhancedQuickInteractionBar } from './EnhancedQuickInteractionBar'

/**
 * Props for the QuickInteractionBar component
 */
interface QuickInteractionBarProps {
  /** The ID of the opportunity to create the interaction for */
  opportunityId: string
  /** The ID of the contact associated with the interaction (optional) */
  contactId?: string | null
  /** The ID of the organization associated with the interaction (optional) */
  organizationId?: string | null
  /** Callback function called when interaction is successfully created */
  onSuccess?: () => void
  /** Callback function called when user cancels the form */
  onCancel?: () => void
  /** Additional CSS classes to apply to the form container */
  className?: string
}

/**
 * QuickInteractionBar Component
 *
 * Enhanced form component for quickly adding interactions to opportunities.
 * Now includes priority selection, account manager selection, and improved UX.
 * Features mobile-optimized touch targets, auto-fill based on interaction type,
 * and validation with loading states.
 *
 * @example
 * ```tsx
 * <QuickInteractionBar
 *   opportunityId="opp-123"
 *   contactId="contact-456"
 *   organizationId="org-789"
 *   onSuccess={() => {
 *     toast.success('Interaction added!')
 *     setShowForm(false)
 *   }}
 *   onCancel={() => setShowForm(false)}
 * />
 * ```
 *
 * @param props - The component props
 * @returns An enhanced form component for creating new interactions
 */
export function QuickInteractionBar({
  opportunityId,
  contactId,
  organizationId,
  onSuccess,
  onCancel,
  className,
}: QuickInteractionBarProps) {
  // Forward all props to the enhanced quick interaction bar
  return (
    <EnhancedQuickInteractionBar
      opportunityId={opportunityId}
      defaultContactId={contactId}
      defaultOrganizationId={organizationId}
      onSuccess={onSuccess}
      onCancel={onCancel}
      className={className}
    />
  )
}
