import { Crown, Shield, Users, Star } from 'lucide-react'
// Removed unused: import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'

// Extended contact interface with weekly context and decision authority tracking
interface ContactWithWeeklyContext {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  title?: string
  department?: string
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

interface ContactExpandedContentProps {
  contact: ContactWithWeeklyContext
}

export function ContactExpandedContent({ contact }: ContactExpandedContentProps) {
  return (
    <div className={semanticSpacing.stack.xl}>
      {/* Decision Authority & Purchase Influence Summary */}
      <div className={cn('grid grid-cols-1 md:grid-cols-3', semanticSpacing.gap.xl)}>
        <div>
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} ${fontWeight.medium} text-foreground`,
              semanticTypography.label
            )}
          >
            Decision Authority
          </h4>
          <div className={semanticSpacing.stack.sm}>
            <div className={`flex items-center ${semanticSpacing.gap.sm}`}>
              {contact.decision_authority_level === 'high' || contact.budget_authority ? (
                <Crown className="size-4 text-warning" />
              ) : contact.decision_authority_level === 'medium' || contact.technical_authority ? (
                <Shield className="size-4 text-primary" />
              ) : (
                <Users className="size-4 text-muted-foreground" />
              )}
              <span className={`${semanticTypography.body} ${fontWeight.medium}`}>
                {contact.decision_authority_level === 'high' || contact.budget_authority
                  ? 'High Authority'
                  : contact.decision_authority_level === 'medium' || contact.technical_authority
                    ? 'Medium Authority'
                    : 'Limited Authority'}
              </span>
            </div>

            <div
              className={`${semanticSpacing.stack.xs} ${semanticTypography.caption} text-muted-foreground`}
            >
              {contact.budget_authority && (
                <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                  <span className={`size-2 ${semanticRadius.badge} bg-success`}></span>
                  Budget Authority
                </div>
              )}
              {contact.technical_authority && (
                <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                  <span className={`size-2 ${semanticRadius.badge} bg-primary`}></span>
                  Technical Authority
                </div>
              )}
              {contact.user_authority && (
                <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                  <span className={`size-2 ${semanticRadius.badge} bg-secondary`}></span>
                  User Authority
                </div>
              )}
              {contact.decision_authority && (
                <div>Legacy Authority: {contact.decision_authority}</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} ${fontWeight.medium} text-foreground`,
              semanticTypography.label
            )}
          >
            Purchase Influence
          </h4>
          <div className={semanticSpacing.stack.sm}>
            {contact.purchase_influence_score ? (
              <div className={`flex items-center ${semanticSpacing.gap.sm}`}>
                <div
                  className={`h-2 w-16 overflow-hidden ${semanticRadius.progressBackground} bg-muted`}
                >
                  <div
                    className={cn(
                      `h-full ${semanticRadius.progressBar}`,
                      contact.purchase_influence_score >= 80
                        ? 'bg-success'
                        : contact.purchase_influence_score >= 60
                          ? 'bg-warning'
                          : 'bg-destructive'
                    )}
                    style={{ width: `${contact.purchase_influence_score}%` }}
                  />
                </div>
                <span className={`${semanticTypography.body} ${fontWeight.medium}`}>
                  {contact.purchase_influence_score}
                </span>
              </div>
            ) : contact.purchase_influence ? (
              <div className={`${semanticTypography.body} text-muted-foreground`}>
                Influence Level: {contact.purchase_influence}
              </div>
            ) : (
              <div className={`${semanticTypography.body} italic text-muted-foreground`}>
                Not assessed
              </div>
            )}

            {contact.high_value_contact && (
              <div className={`flex items-center ${semanticSpacing.gap.xs} text-success`}>
                <Star className="size-3" />
                <span className={semanticTypography.caption}>High Value Contact</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} ${fontWeight.medium} text-foreground`,
              semanticTypography.label
            )}
          >
            Weekly Context
          </h4>
          <div
            className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-muted-foreground`}
          >
            <div className="flex justify-between">
              <span>Recent Interactions:</span>
              <span className={fontWeight.medium}>{contact.recent_interactions_count || 0}</span>
            </div>
            {contact.last_interaction_date && (
              <div className="flex justify-between">
                <span>Last Contact:</span>
                <span className={fontWeight.medium}>
                  {new Date(contact.last_interaction_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {contact.needs_follow_up && (
              <div className={`flex items-center ${semanticSpacing.gap.xs} text-destructive`}>
                <span className={semanticTypography.caption}>⚠️ Follow-up needed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Original contact details */}
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3', semanticSpacing.gap.xl)}>
        {/* Contact Information */}
        <div>
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} ${fontWeight.medium} text-foreground`,
              semanticTypography.label
            )}
          >
            Contact Information
          </h4>
          <div
            className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-muted-foreground`}
          >
            {contact.email && <div>Email: {contact.email}</div>}
            {contact.phone && <div>Phone: {contact.phone}</div>}
            {contact.department && <div>Department: {contact.department}</div>}
          </div>
        </div>

        {/* Organization Details */}
        {contact.organization && (
          <div>
            <h4
              className={cn(
                `${semanticSpacing.bottomGap.sm} ${fontWeight.medium} text-foreground`,
                semanticTypography.label
              )}
            >
              Organization
            </h4>
            <div
              className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-muted-foreground`}
            >
              <div>Name: {contact.organization.name}</div>
              <div>Type: {contact.organization.type}</div>
              {contact.organization.segment && <div>Segment: {contact.organization.segment}</div>}
            </div>
          </div>
        )}

        {/* Role & Status Details */}
        <div>
          <h4
            className={cn(
              `${semanticSpacing.bottomGap.sm} ${fontWeight.medium} text-foreground`,
              semanticTypography.label
            )}
          >
            Role Details
          </h4>
          <div
            className={`${semanticSpacing.stack.xs} ${semanticTypography.body} text-muted-foreground`}
          >
            {contact.title && <div>Title: {contact.title}</div>}
            <div>Primary Contact: {contact.is_primary_contact ? 'Yes' : 'No'}</div>
            {contact.purchase_influence && (
              <div>Legacy Influence: {contact.purchase_influence}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
