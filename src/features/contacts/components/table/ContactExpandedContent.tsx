import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, FileText, Phone, Mail, MapPin, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { ContactWithOrganization } from '@/types/entities'

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

interface ContactExpandedContentProps {
  contact: ContactWithWeeklyContext
  isExpanded: boolean
  showOrganization?: boolean
}

export function ContactExpandedContent({ 
  contact, 
  isExpanded,
  showOrganization = true 
}: ContactExpandedContentProps) {
  const [activeTab, setActiveTab] = useState<'interactions' | 'details'>('details')
  const isMobile = useIsMobile()

  return (
    <div className={cn(
      "bg-gray-50/50 border-l-4 border-primary/20",
      isMobile ? "ml-4" : "ml-10"
    )}>
      {/* Tab Header */}
      <div className={cn(
        "flex items-center justify-between border-b bg-white",
        isMobile ? "px-4 py-3 flex-col gap-3" : "px-6 py-2 flex-row"
      )}>
        <div className={cn(
          "flex gap-1",
          isMobile ? "w-full justify-center" : ""
        )}>
          <Button
            variant={activeTab === 'details' ? 'default' : 'ghost'}
            size={isMobile ? "default" : "sm"}
            onClick={() => setActiveTab('details')}
            className={cn(
              isMobile ? "flex-1 h-12 touch-manipulation" : ""
            )}
          >
            <FileText className={cn(
              isMobile ? "h-4 w-4 mr-2" : "h-3 w-3 mr-1"
            )} />
            Details
          </Button>
          <Button
            variant={activeTab === 'interactions' ? 'default' : 'ghost'}
            size={isMobile ? "default" : "sm"}
            onClick={() => setActiveTab('interactions')}
            className={cn(
              isMobile ? "flex-1 h-12 touch-manipulation" : ""
            )}
          >
            <MessageSquare className={cn(
              isMobile ? "h-4 w-4 mr-2" : "h-3 w-3 mr-1"
            )} />
            Activity
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={cn(
        isMobile ? "p-4" : "p-6"
      )}>
        {activeTab === 'details' ? (
          <ContactDetails contact={contact} showOrganization={showOrganization} />
        ) : (
          <ContactInteractions contact={contact} />
        )}
      </div>
    </div>
  )
}

function ContactDetails({ 
  contact, 
  showOrganization 
}: { 
  contact: ContactWithWeeklyContext
  showOrganization: boolean 
}) {
  const isMobile = useIsMobile()
  
  return (
    <div className={cn(
      "gap-6",
      isMobile ? "grid grid-cols-1 space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}>
      {/* Contact Information */}
      <div>
        <h4 className={cn(
          "mb-2 font-medium text-gray-900",
          isMobile ? "text-base" : ""
        )}>Contact Information</h4>
        <div className={cn(
          "space-y-2 text-gray-600",
          isMobile ? "text-base" : "text-sm"
        )}>
          {contact.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <a href={`mailto:${contact.email}`} className="hover:text-primary">
                {contact.email}
              </a>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <a href={`tel:${contact.phone}`} className="hover:text-primary">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.title && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              <span>{contact.title}</span>
            </div>
          )}
          {contact.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{contact.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Organization Information */}
      {showOrganization && contact.organization && (
        <div>
          <h4 className={cn(
            "mb-2 font-medium text-gray-900",
            isMobile ? "text-base" : ""
          )}>Organization</h4>
          <div className={cn(
            "space-y-1 text-gray-600",
            isMobile ? "text-base" : "text-sm"
          )}>
            <div className="font-medium text-gray-900">{contact.organization.name}</div>
            {contact.organization.type && (
              <div>Type: {contact.organization.type}</div>
            )}
            {contact.organization.segment && (
              <div>Segment: {contact.organization.segment}</div>
            )}
          </div>
        </div>
      )}

      {/* Decision Authority & Influence */}
      <div>
        <h4 className={cn(
          "mb-2 font-medium text-gray-900",
          isMobile ? "text-base" : ""
        )}>Authority & Influence</h4>
        <div className="space-y-2">
          {/* Decision Authority Level */}
          {contact.decision_authority_level && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Decision Authority:</span>
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
            </div>
          )}

          {/* Purchase Influence Score */}
          {contact.purchase_influence_score && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Purchase Influence:</span>
              <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                {contact.purchase_influence_score}%
              </Badge>
            </div>
          )}

          {/* Authority Types */}
          <div className="flex flex-wrap gap-1">
            {contact.budget_authority && (
              <Badge variant="secondary" className="border-green-200 bg-green-50 text-xs text-green-700">
                Budget Authority
              </Badge>
            )}
            {contact.technical_authority && (
              <Badge variant="secondary" className="border-blue-200 bg-blue-50 text-xs text-blue-700">
                Technical Authority
              </Badge>
            )}
            {contact.user_authority && (
              <Badge variant="secondary" className="border-purple-200 bg-purple-50 text-xs text-purple-700">
                User Authority
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className={cn(
          "mb-2 font-medium text-gray-900",
          isMobile ? "text-base" : ""
        )}>Recent Activity</h4>
        <div className={cn(
          "space-y-1 text-gray-600",
          isMobile ? "text-base" : "text-sm"
        )}>
          {contact.recent_interactions_count ? (
            <div>{contact.recent_interactions_count} recent interactions</div>
          ) : (
            <span className="italic text-gray-400">No recent activity</span>
          )}
          {contact.last_interaction_date && (
            <div>
              Last interaction: {new Date(contact.last_interaction_date).toLocaleDateString()}
            </div>
          )}
          {contact.needs_follow_up && (
            <Badge variant="destructive" className="text-xs">
              Needs Follow-up
            </Badge>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <h4 className={cn(
          "mb-2 font-medium text-gray-900",
          isMobile ? "text-base" : ""
        )}>Additional Information</h4>
        <div className={cn(
          "space-y-1 text-gray-600",
          isMobile ? "text-base" : "text-sm"
        )}>
          {contact.is_primary_contact && (
            <Badge variant="secondary" className="border-yellow-200 bg-yellow-50 text-xs text-yellow-700">
              Primary Contact
            </Badge>
          )}
          {contact.high_value_contact && (
            <Badge variant="secondary" className="border-green-200 bg-green-50 text-xs text-green-700">
              High Value Contact
            </Badge>
          )}
          {contact.notes && (
            <div>
              <span className="font-medium">Notes:</span>
              <p className="mt-1">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContactInteractions({ contact }: { contact: ContactWithWeeklyContext }) {
  return (
    <div className="space-y-4">
      <div className="text-center text-gray-500">
        <MessageSquare className="mx-auto h-8 w-8 mb-2" />
        <p>Interaction timeline coming soon</p>
        <p className="text-sm mt-1">
          Integration with interaction tracking system
        </p>
      </div>
    </div>
  )
}