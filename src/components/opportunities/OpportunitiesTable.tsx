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
import { StatusIndicator } from "@/components/ui/status-indicator"
import { PriorityIndicator } from "@/components/ui/priority-indicator"
import { MoreHorizontal, Pencil, Trash2, Plus, Search, ExternalLink, Calendar, Users } from 'lucide-react'
import type { OpportunityWithRelations } from '@/types/entities'

interface OpportunitiesTableProps {
  opportunities: OpportunityWithRelations[]
  loading?: boolean
  onEdit?: (opportunity: OpportunityWithRelations) => void
  onDelete?: (opportunity: OpportunityWithRelations) => void
  onView?: (opportunity: OpportunityWithRelations) => void
  onAddNew?: () => void
  showOrganization?: boolean
}

export function OpportunitiesTable({ 
  opportunities, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView,
  onAddNew,
  showOrganization = true
}: OpportunitiesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOpportunities = opportunities.filter(opportunity =>
    opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opportunity.organization?.name && opportunity.organization.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (opportunity.contact && `${opportunity.contact.first_name} ${opportunity.contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )


  const getStageVariant = (stage: string) => {
    switch (stage) {
      case 'lead':
        return 'outline'
      case 'qualified':
        return 'secondary'
      case 'proposal':
        return 'warning'
      case 'negotiation':
        return 'warning'
      case 'closed_won':
        return 'success'
      case 'closed_lost':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatStage = (stage: string) => {
    return stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false
    const date = new Date(dateString)
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
              placeholder="Search opportunities..."
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          )}
        </div>
        <div className="border rounded-lg">
          <div className="p-8 text-center text-gray-500">
            Loading opportunities...
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
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Opportunity
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity</TableHead>
              {showOrganization && <TableHead>Organization</TableHead>}
              <TableHead>Stage</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOpportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showOrganization ? 8 : 7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No opportunities match your search.' : 'No opportunities found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredOpportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {opportunity.name}
                        {opportunity.description?.includes('Multi-Principal Opportunity') && (
                          <StatusIndicator variant="secondary" size="sm" className="flex items-center gap-1"><Users className="h-3 w-3" />Multi-Principal</StatusIndicator>
                        )}
                      </div>
                      {opportunity.contact && (
                        <div className="text-sm text-gray-500">
                          Contact: {opportunity.contact.first_name} {opportunity.contact.last_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {showOrganization && (
                    <TableCell>
                      {opportunity.organization?.name || 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>
                    <StatusIndicator 
                      variant={getStageVariant(opportunity.stage)} 
                      size="sm"
                    >
                      {formatStage(opportunity.stage)}
                    </StatusIndicator>
                  </TableCell>
                  <TableCell>
                    {opportunity.priority ? (
                      <PriorityIndicator 
                priority={opportunity.priority} 
                showLabel={true}
              />
                    ) : (
                      <span className="text-gray-500">No priority</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(opportunity.estimated_value)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {opportunity.probability ? (
                        <>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${opportunity.probability}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{opportunity.probability}%</span>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {opportunity.estimated_close_date ? (
                        <>
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span className={`text-sm ${isOverdue(opportunity.estimated_close_date) ? 'text-red-600 font-medium' : ''}`}>
                            {formatDate(opportunity.estimated_close_date)}
                          </span>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
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
                          <DropdownMenuItem onClick={() => onView(opportunity)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(opportunity)}
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