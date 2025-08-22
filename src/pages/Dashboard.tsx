import React from 'react'
import { CardNew, CardHeader as CardHeaderNew, CardTitle as CardTitleNew, CardContent as CardContentNew } from '@/components/ui/new/Card'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useOpportunities } from '@/hooks/useOpportunities'
import { useRecentActivity } from '@/hooks/useInteractions'
import { useContacts } from '@/hooks/useContacts'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Building2, Users, Target, MessageSquare } from 'lucide-react'
import type { Organization } from '@/types/entities'

function PrincipalCard({ principal }: { principal: Organization }) {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-mfb-green" />
        <h3 className="font-medium text-sm">{principal.name}</h3>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {principal.description || 'No description available'}
      </p>
      <div className="flex gap-1">
        <Badge variant="secondary" className="text-xs">Principal</Badge>
        {principal.industry && (
          <Badge variant="outline" className="text-xs">{principal.industry}</Badge>
        )}
      </div>
    </div>
  )
}

function ActivityFeed({ interactions }: { interactions: Array<{ id: string; type: string; interaction_date: string; notes?: string | null; outcome?: string | null; description?: string | null; contact?: { first_name: string; last_name: string } | null }> }) {
  if (interactions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent interactions</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="flex gap-3 p-3 border rounded-lg">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm capitalize">
                {interaction.type}
              </span>
              <Badge variant="outline" className="text-xs">
                {interaction.outcome || 'Pending'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {interaction.description || 'No description available'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(interaction.interaction_date), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardPage() {
  const { data: organizations = [], isLoading: orgsLoading, error: orgsError } = useOrganizations()
  const { data: opportunities = [] } = useOpportunities()
  const { data: interactions = [] } = useRecentActivity(10)
  const { data: contacts = [] } = useContacts()

  // Debug: Track Dashboard page data state  
  React.useEffect(() => {
    console.log('🏠 [DashboardPage] Organizations state:', {
      isLoading: orgsLoading,
      organizationsCount: organizations.length,
      error: orgsError?.message
    })
  }, [orgsLoading, organizations.length, orgsError])

  const principals = organizations.filter(org => org.type === 'principal')
  const activeOpportunities = opportunities.filter(opp => 
    !['closed_won', 'closed_lost'].includes(opp.stage)
  )
  const recentInteractions = interactions
    .sort((a, b) => new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-nunito text-mfb-olive mb-6 flex items-center gap-2">
          <Target className="h-8 w-8 text-mfb-green" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to Master Food Brokers CRM - Partnering with Excellence
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardNew>
          <CardHeaderNew className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitleNew className="text-sm font-medium">Total Principals</CardTitleNew>
            <Building2 className="h-4 w-4 text-mfb-olive/60" />
          </CardHeaderNew>
          <CardContentNew>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{principals.length}</div>
            <p className="text-xs text-mfb-olive/60 font-nunito">
              Active partnerships
            </p>
          </CardContentNew>
        </CardNew>

        <CardNew>
          <CardHeaderNew className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitleNew className="text-sm font-medium">Active Opportunities</CardTitleNew>
            <Target className="h-4 w-4 text-mfb-olive/60" />
          </CardHeaderNew>
          <CardContentNew>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{activeOpportunities.length}</div>
            <p className="text-xs text-mfb-olive/60 font-nunito">
              In pipeline
            </p>
          </CardContentNew>
        </CardNew>

        <CardNew>
          <CardHeaderNew className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitleNew className="text-sm font-medium">Total Organizations</CardTitleNew>
            <Building2 className="h-4 w-4 text-mfb-olive/60" />
          </CardHeaderNew>
          <CardContentNew>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{organizations.length}</div>
            <p className="text-xs text-mfb-olive/60 font-nunito">
              All relationships
            </p>
          </CardContentNew>
        </CardNew>

        <CardNew>
          <CardHeaderNew className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitleNew className="text-sm font-medium">Total Contacts</CardTitleNew>
            <Users className="h-4 w-4 text-mfb-olive/60" />
          </CardHeaderNew>
          <CardContentNew>
            <div className="text-2xl font-bold font-nunito text-mfb-green">{contacts.length}</div>
            <p className="text-xs text-mfb-olive/60 font-nunito">
              People in network
            </p>
          </CardContentNew>
        </CardNew>
      </div>

      {/* Principal Overview Cards */}
      {principals.length > 0 && (
        <CardNew>
          <CardHeaderNew>
            <CardTitleNew className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-mfb-green" />
              Principal Overview
            </CardTitleNew>
          </CardHeaderNew>
          <CardContentNew>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {principals.map(principal => (
                <PrincipalCard key={principal.id} principal={principal} />
              ))}
            </div>
          </CardContentNew>
        </CardNew>
      )}

      {/* Recent Activity */}
      <CardNew>
        <CardHeaderNew>
          <CardTitleNew className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-mfb-green" />
            Recent Activity
          </CardTitleNew>
        </CardHeaderNew>
        <CardContentNew>
          <ActivityFeed interactions={recentInteractions} />
        </CardContentNew>
      </CardNew>
    </div>
  )
}

export default DashboardPage