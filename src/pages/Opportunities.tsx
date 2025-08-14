import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OpportunitiesTable } from '@/components/opportunities/OpportunitiesTable'
import { OpportunityForm } from '@/components/opportunities/OpportunityForm'
import { useOpportunities, useCreateOpportunity } from '@/hooks/useOpportunities'
import { Target, Plus, Search, DollarSign, TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { data: opportunities = [], isLoading } = useOpportunities()
  const createOpportunityMutation = useCreateOpportunity()

  const filteredOpportunities = opportunities.filter(opp =>
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opp.organization?.name && opp.organization.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const activeOpportunities = opportunities.filter(opp => 
    !['closed_won', 'closed_lost'].includes(opp.stage)
  )
  
  const wonOpportunities = opportunities.filter(opp => opp.stage === 'closed_won')
  
  const totalValue = opportunities
    .filter(opp => opp.estimated_value)
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)

  const activeValue = activeOpportunities
    .filter(opp => opp.estimated_value)
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-orange-600" />
            Opportunities
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your sales pipeline and deals
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Opportunity</DialogTitle>
            </DialogHeader>
            <OpportunityForm 
              onSubmit={async (data) => {
                try {
                  await createOpportunityMutation.mutateAsync(data as any)
                  setIsCreateDialogOpen(false)
                  toast.success('Opportunity created successfully!')
                } catch (error) {
                  console.error('Failed to create opportunity:', error)
                  toast.error('Failed to create opportunity. Please try again.')
                }
              }}
              loading={createOpportunityMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOpportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wonOpportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${totalValue.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'].map(stage => {
              const stageOpportunities = opportunities.filter(opp => opp.stage === stage)
              const stageValue = stageOpportunities
                .filter(opp => opp.estimated_value)
                .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)
              
              return (
                <div key={stage} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm capitalize">{stage.replace('_', ' ')}</h3>
                    <Badge variant="secondary">{stageOpportunities.length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ${stageValue.toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities by title, stage, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading opportunities...</div>
          ) : (
            <OpportunitiesTable opportunities={filteredOpportunities} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}