import type { DataTableColumn } from '@/components/ui/DataTable'
import { Crown, Shield, Users, Star, Phone, Mail, Building2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ContactActions } from '../ContactActions'
import { cn } from '@/lib/utils'
import {
  semanticSpacing,
  semanticTypography,
  semanticColors,
  semanticRadius,
  fontWeight,
  colors,
} from '@/styles/tokens'
import type { Contact } from '@/types/entities'

// Extended contact interface with weekly context and decision authority tracking
interface ContactWithWeeklyContext extends Contact {
  decision_authority?: string
  decision_authority_level?: 'high' | 'medium' | 'low'
  purchase_influence?: string
  purchase_influence_score?: number
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  needs_follow_up?: boolean
  high_value_contact?: boolean
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean
  is_primary_contact?: boolean
  organization?: {
    name: string
    type: string
    segment?: string
  }
}

interface ContactRowProps {
  selectedItems: Set<string>
  handleSelectItem: (id: string, checked: boolean) => void
  toggleRowExpansion: (contactId: string) => void
  isRowExpanded: (contactId: string) => boolean
  onEditContact: (contact: ContactWithWeeklyContext) => void
  onDeleteContact: (contact: ContactWithWeeklyContext) => void
}

export function useContactColumns({
  selectedItems,
  handleSelectItem,
  toggleRowExpansion,
  isRowExpanded,
  onEditContact,
  onDeleteContact,
}: ContactRowProps): DataTableColumn<ContactWithWeeklyContext>[] {
  return [
    {
      id: 'select',
      header: (contacts: ContactWithWeeklyContext[]) => (
        <Checkbox
          checked={selectedItems.size > 0 && selectedItems.size === contacts.length}
          onCheckedChange={(checked) => {
            if (checked) {
              contacts.forEach((contact) => handleSelectItem(contact.id, true))
            } else {
              contacts.forEach((contact) => handleSelectItem(contact.id, false))
            }
          }}
          aria-label="Select all contacts"
          className={semanticSpacing.interactiveElement}
        />
      ),
      cell: (contact) => (
        <Checkbox
          checked={selectedItems.has(contact.id)}
          onCheckedChange={(checked) => handleSelectItem(contact.id, !!checked)}
          aria-label={`Select contact ${contact.first_name || ''} ${contact.last_name || ''}`}
          className={semanticSpacing.interactiveElement}
        />
      ),
    },
    {
      id: 'expand',
      header: '',
      cell: (contact) => (
        <Button
          variant="ghost"
          onClick={() => toggleRowExpansion(contact.id)}
          className={cn(
            semanticSpacing.interactiveElement,
            `transition-transform duration-200`,
            isRowExpanded(contact.id) && 'rotate-90'
          )}
          aria-label={`${isRowExpanded(contact.id) ? 'Collapse' : 'Expand'} contact details`}
        >
          <span className="sr-only">Toggle row expansion</span>▶
        </Button>
      ),
    },
    {
      key: 'name',
      header: 'Contact',
      cell: (contact) => {
        const fullName =
          `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown Contact'

        return (
          <div
            className={`w-full ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`}
          >
            <div className={`flex items-center ${semanticSpacing.gap.sm}`}>
              <div
                className={cn(
                  `size-8 ${semanticRadius.full} flex items-center justify-center text-white ${fontWeight.medium}`,
                  colors.primary[500],
                  semanticRadius.full,
                  semanticTypography.caption
                )}
              >
                {(contact.first_name?.[0] || contact.last_name?.[0] || 'U').toUpperCase()}
              </div>
              <div className={semanticSpacing.verticalContainer}>
                <div className={cn(`${fontWeight.medium} truncate`, semanticTypography.body)}>
                  {fullName}
                </div>
                {contact.title && (
                  <div className={cn('truncate text-muted-foreground', semanticTypography.caption)}>
                    {contact.title}
                  </div>
                )}
              </div>
            </div>
            {/* Authority indicators - Mobile visible */}
            <div
              className={`flex items-center ${semanticSpacing.gap.xs} ${semanticSpacing.topGap.xs}`}
            >
              {(contact.decision_authority_level === 'high' || contact.budget_authority) && (
                <Crown className="size-3 ${text-warning}" />
              )}
              {(contact.decision_authority_level === 'medium' || contact.technical_authority) && (
                <Shield className="size-3 ${text-primary}" />
              )}
              {contact.high_value_contact && <Star className="size-3 ${text-success}" />}
              {contact.is_primary_contact && (
                <Badge
                  variant="secondary"
                  className={cn(semanticTypography.caption, semanticSpacing.compact)}
                >
                  Primary
                </Badge>
              )}
            </div>
          </div>
        )
      },
      // size: 280,
    },
    {
      key: 'email',
      header: 'Contact Info',
      cell: (contact) => (
        <div
          className={cn(
            `w-full ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`,
            semanticTypography.body
          )}
        >
          {contact.email && (
            <div className={`flex items-center ${semanticSpacing.gap.xs} text-muted-foreground`}>
              <Mail className="size-3" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div
              className={`flex items-center ${semanticSpacing.gap.xs} text-muted-foreground ${semanticSpacing.topGap.xs}`}
            >
              <Phone className="size-3" />
              <span className="truncate">{contact.phone}</span>
            </div>
          )}
          {!contact.email && !contact.phone && (
            <span className={cn('italic text-muted-foreground', semanticTypography.caption)}>
              No contact info
            </span>
          )}
        </div>
      ),
      // size: 200,
    },
    {
      id: 'organization',
      header: 'Organization',
      cell: (contact) => (
        <div
          className={cn(
            `w-full ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`,
            semanticTypography.body
          )}
        >
          {contact.organization ? (
            <>
              <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                <Building2 className="size-3 text-muted-foreground" />
                <span className={`${fontWeight.medium} truncate`}>{contact.organization.name}</span>
              </div>
              {contact.organization.type && (
                <div
                  className={cn(
                    `truncate text-muted-foreground ${semanticSpacing.topGap.xs}`,
                    semanticTypography.caption
                  )}
                >
                  {contact.organization.type}
                </div>
              )}
            </>
          ) : (
            <span className={cn('italic text-muted-foreground', semanticTypography.caption)}>
              No organization
            </span>
          )}
        </div>
      ),
      // size: 180,
    },
    {
      id: 'authority',
      header: 'Authority',
      cell: (contact) => {
        return (
          <div
            className={cn(
              `w-full ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`,
              semanticTypography.body
            )}
          >
            <div className={`flex items-center ${semanticSpacing.gap.sm}`}>
              {contact.decision_authority_level === 'high' || contact.budget_authority ? (
                <>
                  <Crown className="size-4 ${text-warning}" />
                  <span className={fontWeight.medium}>High</span>
                </>
              ) : contact.decision_authority_level === 'medium' || contact.technical_authority ? (
                <>
                  <Shield className="size-4 ${text-primary}" />
                  <span className={fontWeight.medium}>Medium</span>
                </>
              ) : (
                <>
                  <Users className={`size-4 ${semanticColors.text.muted}`} />
                  <span className="text-muted-foreground">Limited</span>
                </>
              )}
            </div>
            {/* Authority types - compact indicators */}
            <div className={`flex ${semanticSpacing.gap.xs} ${semanticSpacing.topGap.xs}`}>
              {contact.budget_authority && (
                <div
                  className={cn('size-2 rounded-full bg-green-500', semanticRadius.full)}
                  title="Budget Authority"
                />
              )}
              {contact.technical_authority && (
                <div
                  className={cn('size-2 rounded-full bg-blue-500', semanticRadius.full)}
                  title="Technical Authority"
                />
              )}
              {contact.user_authority && (
                <div
                  className={cn('size-2 rounded-full bg-purple-500', semanticRadius.full)}
                  title="User Authority"
                />
              )}
            </div>
          </div>
        )
      },
      // size: 120,
    },
    {
      id: 'influence',
      header: 'Influence',
      cell: (contact) => {
        return (
          <div
            className={cn(
              `w-full ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`,
              semanticTypography.body
            )}
          >
            {contact.purchase_influence_score ? (
              <div className={`flex items-center ${semanticSpacing.gap.sm}`}>
                <div
                  className={cn(
                    `h-2 w-12 overflow-hidden ${semanticColors.background.muted}`,
                    semanticRadius.sm
                  )}
                >
                  <div
                    className={cn(
                      'h-full',
                      semanticRadius.sm,
                      contact.purchase_influence_score >= 80
                        ? 'bg-success'
                        : contact.purchase_influence_score >= 60
                          ? 'bg-warning'
                          : 'bg-destructive'
                    )}
                    style={{ width: `${contact.purchase_influence_score}%` }}
                  />
                </div>
                <span className={cn(fontWeight.medium, semanticTypography.caption)}>
                  {contact.purchase_influence_score}
                </span>
              </div>
            ) : contact.purchase_influence ? (
              <div className={cn('text-muted-foreground', semanticTypography.caption)}>
                {contact.purchase_influence}
              </div>
            ) : (
              <span className={cn('italic text-muted-foreground', semanticTypography.caption)}>
                Not assessed
              </span>
            )}
            {contact.high_value_contact && (
              <div
                className={`flex items-center ${semanticSpacing.gap.xs} ${text - success} ${semanticSpacing.topGap.xs}`}
              >
                <Star className="size-3" />
                <span className={semanticTypography.caption}>High Value</span>
              </div>
            )}
          </div>
        )
      },
      // size: 100,
    },
    {
      id: 'activity',
      header: 'Activity',
      cell: (contact) => {
        return (
          <div
            className={cn(
              `w-full ${semanticSpacing.layoutContainer} ${semanticSpacing.verticalContainer}`,
              semanticTypography.caption
            )}
          >
            <div className={`flex justify-between ${semanticSpacing.gap.sm}`}>
              <span className="text-muted-foreground">Interactions:</span>
              <span className={fontWeight.medium}>{contact.recent_interactions_count || 0}</span>
            </div>
            {contact.last_interaction_date && (
              <div
                className={`flex justify-between ${semanticSpacing.gap.sm} ${semanticSpacing.topGap.xs}`}
              >
                <span className="text-muted-foreground">Last:</span>
                <span className={fontWeight.medium}>
                  {new Date(contact.last_interaction_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {contact.needs_follow_up && (
              <div
                className={`flex items-center ${semanticSpacing.gap.xs} ${text - destructive} ${semanticSpacing.topGap.xs}`}
              >
                <span>⚠️ Follow-up needed</span>
              </div>
            )}
          </div>
        )
      },
      // size: 120,
    },
    {
      id: 'actions',
      header: '',
      cell: (contact) => (
        <ContactActions
          contact={contact}
          onEdit={onEditContact}
          onView={undefined}
          onContact={undefined}
          variant="ghost"
          size="sm"
        />
      ),
      // size: 80,
    },
  ]
}
