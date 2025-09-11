import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ContactBadges } from '../ContactBadges'
import { 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  Crown, 
  Users, 
  Star,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contact, ContactWithOrganization } from '@/types/entities'
import type { DataTableColumn } from '@/components/ui/DataTable'

// Extended contact interface with weekly context and decision authority tracking
interface ContactWithWeeklyContext extends ContactWithOrganization {
  decision_authority_level?: 'high' | 'medium' | 'low'
  purchase_influence_score?: number
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  needs_follow_up?: boolean
  high_value_contact?: boolean
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean
}

export function useContactColumns({
  selectedItems,
  onSelectAll,
  onSelectItem,
  onToggleExpansion,
  isRowExpanded,
  onEdit,
  onDelete,
  onView,
  onContact,
  showOrganization = true,
}: {
  selectedItems: Set<string>
  onSelectAll: (checked: boolean, items: ContactWithWeeklyContext[]) => void
  onSelectItem: (id: string, checked: boolean) => void
  onToggleExpansion: (id: string) => void
  isRowExpanded: (id: string) => boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
  showOrganization?: boolean
}) {
  const columns: DataTableColumn<ContactWithWeeklyContext>[] = [
    {
      key: 'selection',
      header: (sortedContacts: ContactWithWeeklyContext[]) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedItems.size > 0 && selectedItems.size === sortedContacts.length}
            onCheckedChange={(checked) => onSelectAll(!!checked, sortedContacts)}
            aria-label="Select all contacts"
          />
        </div>
      ),
      cell: (contact) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(contact.id)}
            className="h-auto p-0 text-gray-400 hover:bg-transparent hover:text-gray-600"
            aria-label={isRowExpanded(contact.id) ? 'Collapse details' : 'Expand details'}
          >
            {isRowExpanded(contact.id) ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
          <Checkbox
            checked={selectedItems.has(contact.id)}
            onCheckedChange={(checked) => onSelectItem(contact.id, !!checked)}
            aria-label={`Select ${contact.first_name} ${contact.last_name}`}
          />
        </div>
      ),
      className: 'w-[60px] px-6 py-3',
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (contact) => <ContactNameCell contact={contact} />,
      className: 'w-[30%] px-6 py-3',
    },
    ...(showOrganization ? [{
      key: 'organization' as const,
      header: 'Organization',
      cell: (contact: ContactWithWeeklyContext) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {contact.organization?.name || 'No Organization'}
          </div>
          {contact.organization?.type && (
            <div className="text-xs text-gray-500">{contact.organization.type}</div>
          )}
        </div>
      ),
      className: 'w-[25%] px-6 py-3',
      hidden: { sm: true },
    }] : []),
    {
      key: 'contact_info',
      header: 'Contact Info',
      cell: (contact) => (
        <div className="space-y-1">
          {contact.email && (
            <div className="text-sm text-gray-900">{contact.email}</div>
          )}
          {contact.phone && (
            <div className="text-xs text-gray-500">{contact.phone}</div>
          )}
        </div>
      ),
      className: 'w-[20%] px-6 py-3',
      hidden: { sm: true, md: true },
    },
    {
      key: 'authority',
      header: 'Authority',
      cell: (contact) => <ContactAuthorityCell contact={contact} />,
      className: 'w-[15%] px-6 py-3',
      hidden: { sm: true },
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (contact) => (
        <ContactActionsCell
          contact={contact}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onContact={onContact}
        />
      ),
      className: 'w-[10%] px-6 py-3 text-right',
    },
  ]

  return columns
}

function ContactNameCell({ contact }: { contact: ContactWithWeeklyContext }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-gray-900">
          {contact.first_name} {contact.last_name}
        </div>
        
        {/* Authority Icons */}
        <div className="flex items-center gap-1">
          {contact.decision_authority_level === 'high' || contact.budget_authority ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Crown className="size-3 text-yellow-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>High Decision Authority</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : contact.decision_authority_level === 'medium' || contact.technical_authority ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Shield className="size-3 text-blue-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Medium Decision Authority</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          
          {contact.high_value_contact && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Star className="size-3 text-green-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>High Value Contact</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {contact.is_primary_contact && <span className="fill-current text-yellow-500">⭐</span>}
          
          {contact.needs_follow_up && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <span className="size-2 animate-pulse rounded-full bg-red-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Needs follow-up</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {/* Authority Type Badges */}
        {contact.budget_authority && (
          <Badge variant="secondary" className="border-green-200 bg-green-50 text-xs text-green-700">
            Budget
          </Badge>
        )}
        {contact.technical_authority && (
          <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
            Technical
          </Badge>
        )}
        {contact.user_authority && (
          <Badge variant="secondary" className="border-purple-200 bg-purple-50 text-xs text-purple-700">
            User
          </Badge>
        )}
        
        {/* Purchase Influence Badge */}
        {contact.purchase_influence_score && contact.purchase_influence_score > 60 && (
          <Badge variant="secondary" className="border-orange-200 bg-orange-50 text-xs text-orange-700">
            {contact.purchase_influence_score}% influence
          </Badge>
        )}
        
        {/* Recent Activity Badge */}
        {(contact.recent_interactions_count || 0) > 0 && (
          <Badge variant="secondary" className="border-gray-200 bg-gray-50 text-xs text-gray-700">
            {contact.recent_interactions_count} recent
          </Badge>
        )}
      </div>

      {/* Title */}
      {contact.title && (
        <div className="text-xs text-muted-foreground">
          {contact.title}
        </div>
      )}
    </div>
  )
}

function ContactAuthorityCell({ contact }: { contact: ContactWithWeeklyContext }) {
  return (
    <div className="space-y-1">
      {contact.decision_authority_level && (
        <Badge 
          variant="secondary" 
          className={cn(
            "text-xs",
            contact.decision_authority_level === 'high' ? "border-green-200 bg-green-50 text-green-700" :
            contact.decision_authority_level === 'medium' ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
            "border-gray-200 bg-gray-50 text-gray-700"
          )}
        >
          {contact.decision_authority_level}
        </Badge>
      )}
      {contact.purchase_influence_score && (
        <div className="text-xs text-gray-500">
          {contact.purchase_influence_score}% influence
        </div>
      )}
    </div>
  )
}

function ContactActionsCell({ 
  contact, 
  onEdit, 
  onDelete, 
  onView, 
  onContact 
}: { 
  contact: ContactWithWeeklyContext
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onContact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onContact(contact)}
          className="h-8 w-8 p-0"
        >
          <Users className="h-3 w-3" />
        </Button>
      )}
      {onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(contact)}
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}