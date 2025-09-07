import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateInteraction } from '../hooks/useInteractions'
import { Phone, Mail, Calendar, MessageSquare, Users, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { InteractionType, InteractionInsert } from '@/types/entities'

// Type for interaction creation without auto-provided fields
type QuickInteractionData = Omit<InteractionInsert, 'created_by' | 'updated_by'>

const INTERACTION_TYPES: Array<{
  value: InteractionType
  icon: React.ComponentType<{ className?: string }>
  label: string
}> = [
  { value: 'call', icon: Phone, label: 'Call' },
  { value: 'email', icon: Mail, label: 'Email' },
  { value: 'meeting', icon: Calendar, label: 'Meeting' },
  { value: 'follow_up', icon: MessageSquare, label: 'Note' },
  { value: 'demo', icon: Users, label: 'Demo' },
]

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
 * A compact form component for quickly adding interactions to opportunities.
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
 * @returns A form component for creating new interactions with mobile-responsive design
 */
export function QuickInteractionBar({ 
  opportunityId, 
  contactId,
  organizationId,
  onSuccess, 
  onCancel,
  className
}: QuickInteractionBarProps) {
  const [selectedType, setSelectedType] = useState<InteractionType>('follow_up')
  const [subject, setSubject] = useState('')
  const [notes, setNotes] = useState('')
  const [followUp, setFollowUp] = useState(false)
  
  const createInteraction = useCreateInteraction()
  const isMobile = useIsMobile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim()) {
      toast.error('Please add a subject')
      return
    }

    try {
      // The useCreateInteraction hook handles adding created_by and updated_by automatically
      const interactionData: QuickInteractionData = {
        type: selectedType,
        subject: subject.trim(),
        description: notes.trim() || null,
        opportunity_id: opportunityId,
        contact_id: contactId,
        organization_id: organizationId,
        interaction_date: new Date().toISOString(),
        follow_up_required: followUp,
        follow_up_date: followUp ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null, // 7 days from now if follow-up needed
      }
      
      await createInteraction.mutateAsync(interactionData as InteractionInsert)
      
      toast.success('Interaction added!')
      
      // Reset form
      setSubject('')
      setNotes('')
      setFollowUp(false)
      
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to add interaction')
      // TODO: Add proper error logging/tracking
    }
  }

  const handleTypeSelect = (type: InteractionType) => {
    setSelectedType(type)
    
    // Auto-fill subject based on type
    const defaultSubjects: Record<InteractionType, string> = {
      call: 'Follow-up call',
      email: 'Email correspondence',
      meeting: 'Meeting discussion',
      demo: 'Product demonstration',
      proposal: 'Proposal discussion',
      follow_up: 'Follow-up contact',
      trade_show: 'Trade show interaction',
      site_visit: 'Site visit',
      contract_review: 'Contract review'
    }
    
    if (!subject.trim()) {
      setSubject(defaultSubjects[type] || '')
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "bg-blue-50/50 border-b space-y-3",
        isMobile ? "p-3" : "p-4",
        className
      )}
    >
      {/* Type selector - mobile optimized */}
      <div className={cn(
        "flex items-start gap-2",
        isMobile ? "flex-col" : "flex-row flex-wrap"
      )}>
        <span className="text-sm text-gray-600 mr-2 whitespace-nowrap">
          {isMobile ? "Type" : "Type:"}
        </span>
        <div className={cn(
          "flex gap-2 flex-wrap",
          isMobile ? "w-full" : ""
        )}>
          {INTERACTION_TYPES.map((type) => {
            const Icon = type.icon
            return (
              <Button
                key={type.value}
                type="button"
                size="sm"
                variant={selectedType === type.value ? 'default' : 'outline'}
                onClick={() => handleTypeSelect(type.value)}
                className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-12 px-4 min-w-[80px] text-base" : "h-8 px-3",
                  // Ensure minimum touch target size on mobile (44px)
                  isMobile && "touch-manipulation"
                )}
              >
                <Icon className={cn(
                  isMobile ? "h-4 w-4 mr-2" : "h-3 w-3 mr-1"
                )} />
                {type.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Input fields - mobile optimized */}
      <div className={cn(
        isMobile ? "space-y-3" : "space-y-2"
      )}>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={`Quick ${selectedType} summary...`}
          className={cn(
            "w-full",
            isMobile ? "h-12 text-base" : "",
            // Improve mobile input experience
            isMobile && "focus:ring-2 focus:ring-blue-500"
          )}
          autoFocus={!isMobile} // Don't auto-focus on mobile to avoid keyboard popup
        />
        
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add details... (optional)"
          rows={isMobile ? 3 : 2}
          className={cn(
            "resize-none w-full",
            isMobile ? "text-base" : "",
            // Improve mobile textarea experience
            isMobile && "focus:ring-2 focus:ring-blue-500"
          )}
        />
      </div>

      {/* Actions - mobile optimized layout */}
      <div className={cn(
        isMobile ? "flex-col space-y-3" : "flex items-center justify-between",
        isMobile ? "" : "flex"
      )}>
        <label className={cn(
          "flex items-center gap-2 cursor-pointer",
          isMobile ? "text-base" : "text-sm"
        )}>
          <input
            type="checkbox"
            checked={followUp}
            onChange={(e) => setFollowUp(e.target.checked)}
            className={cn(
              "rounded border-gray-300 text-blue-600 focus:ring-blue-500",
              // Larger checkbox on mobile for better touch targets
              isMobile ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <span className="select-none">Follow-up needed</span>
        </label>
        
        <div className={cn(
          "flex gap-2",
          isMobile ? "w-full" : ""
        )}>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size={isMobile ? "default" : "sm"}
              onClick={onCancel}
              disabled={createInteraction.isPending}
              className={cn(
                isMobile ? "flex-1 h-12" : "",
                // Ensure minimum touch target
                isMobile && "touch-manipulation"
              )}
            >
              <X className={cn(
                isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 mr-1"
              )} />
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size={isMobile ? "default" : "sm"}
            disabled={createInteraction.isPending || !subject.trim()}
            className={cn(
              isMobile ? "flex-1 h-12" : "",
              // Ensure minimum touch target
              isMobile && "touch-manipulation"
            )}
          >
            <Send className={cn(
              isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 mr-1"
            )} />
            {createInteraction.isPending ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </div>
    </form>
  )
}