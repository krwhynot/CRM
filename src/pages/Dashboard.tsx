import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useOpportunities } from '@/hooks/useOpportunities'
import { useInteractions } from '@/hooks/useInteractions'
import { useContacts } from '@/hooks/useContacts'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Building2, Users, Target, MessageSquare } from 'lucide-react'
import type { Organization } from '@/types/entities'

function PrincipalCard({ principal }: { principal: Organization }) {
  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-blue-600" />
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

function ActivityFeed({ interactions }: { interactions: Array<{ id: string; type: string; interaction_date: string; notes?: string; contact?: { first_name: string; last_name: string } }> }) {
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
                {interaction.direction}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {interaction.summary || 'No summary available'}
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
  const { data: organizations = [] } = useOrganizations()
  const { data: opportunities = [] } = useOpportunities()
  const { data: interactions = [] } = useInteractions()
  const { data: contacts = [] } = useContacts()

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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Target className="h-8 w-8 text-blue-600" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to Master Food Brokers CRM - Partnering with Excellence
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Principals</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{principals.length}</div>
            <p className="text-xs text-muted-foreground">
              Active partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              In pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
            <p className="text-xs text-muted-foreground">
              All relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-muted-foreground">
              People in network
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Principal Overview Cards */}
      {principals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Principal Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {principals.map(principal => (
                <PrincipalCard key={principal.id} principal={principal} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed interactions={recentInteractions} />
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage