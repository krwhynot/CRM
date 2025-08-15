import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InteractionsTable } from '@/components/interactions/InteractionsTable'
import { InteractionForm } from '@/components/interactions/InteractionForm'
import { 
  useInteractions, 
  useInteractionStats, 
  useCreateInteraction, 
  useUpdateInteraction, 
  useDeleteInteraction,
} from '@/hooks/useInteractions'
import { 
  MessageSquare, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Activity 
} from 'lucide-react'
import type { InteractionWithRelations, InteractionUpdate } from '@/types/entities'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export function InteractionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<InteractionWithRelations | null>(null)
  
  const { data: interactions = [], isLoading } = useInteractions()
  const { data: stats } = useInteractionStats()
  const createInteractionMutation = useCreateInteraction()
  const updateInteractionMutation = useUpdateInteraction()
  const deleteInteractionMutation = useDeleteInteraction()

  const filteredInteractions = interactions.filter(interaction =>
    interaction.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interaction.organization?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interaction.contact?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interaction.contact?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (interaction: InteractionWithRelations) => {
    setEditingInteraction(interaction)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (interaction: InteractionWithRelations) => {
    if (window.confirm(`Are you sure you want to delete the interaction "${interaction.subject}"?`)) {
      try {
        await deleteInteractionMutation.mutateAsync(interaction.id)
        toast.success('Interaction deleted successfully!')
      } catch (error) {
        console.error('Failed to delete interaction:', error)
        toast.error('Failed to delete interaction. Please try again.')
      }
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            Interactions
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all customer touchpoints and communication history
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Interaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Interaction</DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <InteractionForm 
              onSubmit={async (data) => {
                try {
                  // Transform form data to match InteractionInsert interface
                  const interactionData = {
                    ...data,
                    // Handle date fields - convert empty strings to null
                    follow_up_date: data.follow_up_date && typeof data.follow_up_date === 'string' && data.follow_up_date.trim() !== '' ? data.follow_up_date : null,
                    // Ensure boolean field is properly typed
                    follow_up_required: Boolean(data.follow_up_required)
                  } as any
                  
                  console.log('Submitting interaction data:', interactionData)
                  await createInteractionMutation.mutateAsync(interactionData)
                  setIsCreateDialogOpen(false)
                  toast.success('Interaction created successfully!')
                } catch (error) {
                  console.error('Failed to create interaction:', error)
                  
                  // More detailed error handling
                  if (error instanceof Error) {
                    toast.error(`Failed to create interaction: ${error.message}`)
                  } else {
                    toast.error('Failed to create interaction. Please try again.')
                  }
                }
              }}
              loading={createInteractionMutation.isPending}
            />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Interaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Interaction</DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              {editingInteraction && (
                <InteractionForm 
                initialData={editingInteraction}
                onSubmit={async (data) => {
                  try {
                    await updateInteractionMutation.mutateAsync({
                      id: editingInteraction.id,
                      updates: data as InteractionUpdate
                    })
                    setIsEditDialogOpen(false)
                    setEditingInteraction(null)
                    toast.success('Interaction updated successfully!')
                  } catch (error) {
                    console.error('Failed to update interaction:', error)
                    toast.error('Failed to update interaction. Please try again.')
                  }
                }}
                loading={updateInteractionMutation.isPending}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Needed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.followUpsNeeded || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentActivity || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Type</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.byType ? Object.keys(stats.byType).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Interaction types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interaction Types Breakdown */}
      {stats?.byType && Object.keys(stats.byType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interaction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm capitalize">{type.replace('_', ' ')}</h3>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((count / (stats.total || 1)) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Interactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search interactions by subject, description, organization, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading interactions...</div>
          ) : (
            <InteractionsTable 
              interactions={filteredInteractions} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}