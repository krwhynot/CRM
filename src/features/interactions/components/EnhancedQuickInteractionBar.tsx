import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useCreateInteraction } from '../hooks/useInteractions'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { Send, X, Star, Users, Phone, Mail, Calendar, Package, FileText } from 'lucide-react'
import type { 
  InteractionType, 
  InteractionInsert, 
  InteractionPriority,
  AccountManager 
} from '@/types/entities'
import { 
  MOBILE_INTERACTION_TEMPLATES,
  PRIORITY_COLORS, 
  ACCOUNT_MANAGERS 
} from '@/types/interaction.types'

// Enhanced interaction types with icons
const ENHANCED_INTERACTION_TYPES = [
  { value: 'in_person', icon: Users, label: 'In Person', priority: 'A' },
  { value: 'call', icon: Phone, label: 'Call', priority: 'B' },
  { value: 'email', icon: Mail, label: 'Email', priority: 'C' },
  { value: 'quoted', icon: FileText, label: 'Quoted', priority: 'A' },
  { value: 'demo', icon: Users, label: 'Demo', priority: 'A' },
  { value: 'distribution', icon: Package, label: 'Distribution', priority: 'B' },
  { value: 'meeting', icon: Calendar, label: 'Meeting', priority: 'B' },
] as const

const PRIORITY_OPTIONS = [
  { value: 'A+', label: 'A+ (Critical)', color: PRIORITY_COLORS['A+'] },
  { value: 'A', label: 'A (High)', color: PRIORITY_COLORS['A'] },
  { value: 'B', label: 'B (Medium)', color: PRIORITY_COLORS['B'] },
  { value: 'C', label: 'C (Normal)', color: PRIORITY_COLORS['C'] },
  { value: 'D', label: 'D (Low)', color: PRIORITY_COLORS['D'] },
] as const

interface EnhancedQuickInteractionBarProps {
  opportunityId: string
  defaultOrganizationId?: string | null
  defaultContactId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function EnhancedQuickInteractionBar({ 
  opportunityId,
  defaultOrganizationId,
  defaultContactId,
  onSuccess, 
  onCancel,
  className
}: EnhancedQuickInteractionBarProps) {
  const [type, setType] = useState<InteractionType>('in_person')
  const [priority, setPriority] = useState<InteractionPriority | ''>('')
  const [subject, setSubject] = useState('')
  const [notes, setNotes] = useState('')
  const [organizationId, setOrganizationId] = useState(defaultOrganizationId || 'none')
  const [contactId, setContactId] = useState(defaultContactId || 'none')
  const [accountManager, setAccountManager] = useState<AccountManager | 'none'>('none')
  const [followUp, setFollowUp] = useState(false)
  
  const createInteraction = useCreateInteraction()
  const { data: organizations } = useOrganizations()
  const { data: contacts } = useContacts()
  const isMobile = useIsMobile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!type) {
      toast.error('Please select an interaction type')
      return
    }

    if (!subject.trim()) {
      toast.error('Please add a subject')
      return
    }

    try {
      const interactionData: InteractionInsert = {
        type,
        subject: subject.trim(),
        description: notes.trim() || null,
        opportunity_id: opportunityId,
        contact_id: contactId === 'none' ? null : contactId,
        organization_id: organizationId === 'none' ? null : organizationId,
        interaction_date: new Date().toISOString(),
        follow_up_required: followUp,
        follow_up_date: followUp ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        // Enhanced fields
        priority: priority || null,
        account_manager: accountManager === 'none' ? null : accountManager,
        principals: [], // Will be populated from organization relationships
        created_by: '', // Will be set by the mutation hook
        updated_by: '', // Will be set by the mutation hook
      }
      
      await createInteraction.mutateAsync(interactionData)
      
      toast.success(`${type.replace('_', ' ').toUpperCase()} interaction added!`)
      
      // Reset form
      setSubject('')
      setNotes('')
      setPriority('')
      setAccountManager('none')
      setFollowUp(false)
      
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to add interaction')
      console.error('Interaction creation error:', error)
    }
  }

  const handleTypeSelect = (selectedType: InteractionType) => {
    setType(selectedType)
    
    // Find the template and auto-fill
    const template = MOBILE_INTERACTION_TEMPLATES.find(t => t.type === selectedType)
    if (template && !subject.trim()) {
      setSubject(template.subject)
      setNotes(template.defaultNotes)
      setPriority(template.priority)
    }
    
    // Auto-suggest priority based on type
    const typeConfig = ENHANCED_INTERACTION_TYPES.find(t => t.value === selectedType)
    if (typeConfig && !priority) {
      setPriority(typeConfig.priority as InteractionPriority)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn(
        "bg-blue-50/30 border-y space-y-4",
        isMobile ? "p-3" : "p-4",
        className
      )}
    >
      {/* Row 1: Type Selection */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Interaction Type</span>
        <div className={cn(
          "flex gap-2 flex-wrap",
          isMobile && "grid grid-cols-2 gap-2"
        )}>
          {ENHANCED_INTERACTION_TYPES.map((typeOption) => {
            const Icon = typeOption.icon
            return (
              <Button
                key={typeOption.value}
                type="button"
                size={isMobile ? "default" : "sm"}
                variant={type === typeOption.value ? 'default' : 'outline'}
                onClick={() => handleTypeSelect(typeOption.value as InteractionType)}
                className={cn(
                  "flex-1 min-w-0",
                  isMobile && "h-12 text-sm flex-col gap-1"
                )}
              >
                <Icon className={cn(
                  isMobile ? "h-4 w-4" : "h-3 w-3 mr-2"
                )} />
                {typeOption.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Row 2: Priority and Account Manager */}
      <div className={cn(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* Priority Selection */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Priority</span>
          <div className="flex gap-1">
            {PRIORITY_OPTIONS.map((p) => (
              <Button
                key={p.value}
                type="button"
                size="sm"
                variant={priority === p.value ? 'default' : 'outline'}
                onClick={() => setPriority(priority === p.value ? '' : p.value as InteractionPriority)}
                className={cn(
                  "h-8 px-3 font-bold",
                  priority === p.value && p.color.badge
                )}
              >
                {p.value}
              </Button>
            ))}
          </div>
        </div>

        {/* Account Manager */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Account Manager</span>
          <Select value={accountManager} onValueChange={setAccountManager}>
            <SelectTrigger className={isMobile ? "h-12" : ""}>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {ACCOUNT_MANAGERS.map((manager) => (
                <SelectItem key={manager} value={manager}>
                  {manager}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 3: Organization and Contact */}
      <div className={cn(
        "grid gap-3",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Organization</span>
          <Select value={organizationId} onValueChange={setOrganizationId}>
            <SelectTrigger className={isMobile ? "h-12" : ""}>
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {organizations?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Contact</span>
          <Select value={contactId} onValueChange={setContactId}>
            <SelectTrigger className={isMobile ? "h-12" : ""}>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {contacts?.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 4: Subject */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Subject</span>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What happened during this interaction?"
          className={isMobile ? "h-12 text-base" : ""}
        />
      </div>

      {/* Row 5: Notes */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Detailed Notes</span>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add detailed notes about the interaction..."
          rows={isMobile ? 3 : 2}
          className={cn(
            "resize-none",
            isMobile ? "text-base" : ""
          )}
        />
      </div>

      {/* Row 6: Actions */}
      <div className={cn(
        "flex items-center justify-between pt-2",
        isMobile && "flex-col space-y-3"
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
              isMobile ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          <span>Follow-up needed</span>
        </label>
        
        <div className={cn(
          "flex gap-2",
          isMobile && "w-full"
        )}>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size={isMobile ? "default" : "sm"}
              onClick={onCancel}
              disabled={createInteraction.isPending}
              className={isMobile ? "h-12 flex-1" : ""}
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
            disabled={createInteraction.isPending || !subject.trim() || !type}
            className={isMobile ? "h-12 flex-1" : ""}
          >
            <Send className={cn(
              isMobile ? "h-5 w-5 mr-2" : "h-4 w-4 mr-1"
            )} />
            {createInteraction.isPending ? 'Adding...' : 'Add Interaction'}
          </Button>
        </div>
      </div>

      {/* Priority and Account Manager Preview */}
      {(priority || accountManager) && (
        <div className="flex items-center gap-2 border-t pt-2">
          <span className="text-sm text-gray-600">Preview:</span>
          {priority && (
            <Badge className={cn(
              "text-xs font-bold", 
              PRIORITY_COLORS[priority].badge
            )}>
              {priority} Priority
            </Badge>
          )}
          {accountManager && (
            <Badge variant="outline" className="text-xs">
              <Users className="mr-1 size-3" />
              {accountManager}
            </Badge>
          )}
        </div>
      )}
    </form>
  )
}