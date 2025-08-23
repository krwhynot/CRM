import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { QuickActionsBar } from '@/components/ui/new/QuickActionsBar'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  ExternalLink, 
  Calendar, 
  Clock,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionsTableProps {
  interactions: InteractionWithRelations[]
  loading?: boolean
  onEdit?: (interaction: InteractionWithRelations) => void
  onDelete?: (interaction: InteractionWithRelations) => void
  onView?: (interaction: InteractionWithRelations) => void
  onAddNew?: () => void
  showOrganization?: boolean
}

export function InteractionsTable({ 
  interactions, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onAddNew,
  showOrganization = true
}: InteractionsTableProps) {
  // Feature flag for new MFB compact styling (default: enabled, opt-out with 'false')
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false';
  const [searchTerm, setSearchTerm] = useState('')

  const filteredInteractions = interactions.filter(interaction =>
    interaction.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (interaction.organization?.name && interaction.organization.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (interaction.contact && `${interaction.contact.first_name} ${interaction.contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800'
      case 'phone':
        return 'bg-green-100 text-green-800'
      case 'meeting':
        return 'bg-purple-100 text-purple-800'
      case 'demo':
        return 'bg-orange-100 text-orange-800'
      case 'proposal':
        return 'bg-yellow-100 text-yellow-800'
      case 'follow_up':
        return 'bg-cyan-100 text-cyan-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const isFollowUpOverdue = (followUpDate: string | null) => {
    if (!followUpDate) return false
    const date = new Date(followUpDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    return date < today
  }


  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search interactions..."
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Interaction
            </Button>
          )}
        </div>
        <div className="border rounded-lg">
          <div className="p-8 text-center text-gray-500">
            Loading interactions...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search interactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Interaction
          </Button>
        )}
      </div>

      {/* Quick Actions Bar - only show with new styling */}
      {USE_NEW_STYLE && (
        <QuickActionsBar
          onQuickAdd={onAddNew}
          selectedCount={0} // TODO: Implement selection state
          onBulkAction={(action: string) => {
            console.log('Bulk action selected:', action);
            // TODO: Implement bulk operations
          }}
        />
      )}

      <div className="border rounded-lg">
        <Table className={cn(USE_NEW_STYLE && "compact-table")}>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              {showOrganization && <TableHead>Organization</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInteractions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showOrganization ? 8 : 7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No interactions match your search.' : 'No interactions found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInteractions.map((interaction) => (
                <TableRow key={interaction.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold flex items-center">
                        <span>{interaction.subject}</span>
                      </div>
                      {interaction.contact && (
                        <div className="text-sm text-gray-500">
                          Contact: {interaction.contact.first_name} {interaction.contact.last_name}
                        </div>
                      )}
                      {interaction.opportunity && (
                        <div className="text-sm text-gray-500">
                          Opportunity: {interaction.opportunity.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {showOrganization && (
                    <TableCell>
                      {interaction.organization?.name || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge className={getTypeColor(interaction.type)}>
                      {formatType(interaction.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm">
                        {formatDate(interaction.interaction_date)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm">
                        {formatDuration(interaction.duration_minutes)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {interaction.follow_up_required ? (
                      <div className="flex items-center">
                        {isFollowUpOverdue(interaction.follow_up_date) ? (
                          <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                        ) : (
                          <Calendar className="h-4 w-4 mr-1 text-yellow-500" />
                        )}
                        <span className={`text-sm ${isFollowUpOverdue(interaction.follow_up_date) ? 'text-red-600 font-medium' : ''}`}>
                          {interaction.follow_up_date ? formatDate(interaction.follow_up_date) : 'Pending'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(interaction)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(interaction)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(interaction)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}