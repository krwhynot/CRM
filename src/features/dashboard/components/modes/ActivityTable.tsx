import React, { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  MessageSquare, 
  Plus, 
  Edit3,
  DollarSign,
  Calendar,
  Building,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { ActivityTableRow } from '@/types/dashboard'

interface ActivityTableProps {
  data: ActivityTableRow[]
  loading?: boolean
  className?: string
}

type SortField = keyof ActivityTableRow
type SortDirection = 'asc' | 'desc'

const getActivityIcon = (type: ActivityTableRow['type']) => {
  switch (type) {
    case 'interaction':
      return <MessageSquare className="size-4 text-blue-600" />
    case 'opportunity_created':
      return <Plus className="size-4 text-green-600" />
    case 'opportunity_updated':
      return <Edit3 className="size-4 text-yellow-600" />
    default:
      return <Calendar className="size-4 text-gray-600" />
  }
}

const getActivityLabel = (type: ActivityTableRow['type']) => {
  switch (type) {
    case 'interaction':
      return 'Interaction'
    case 'opportunity_created':
      return 'Opportunity Created'
    case 'opportunity_updated':
      return 'Opportunity Updated'
    default:
      return type
  }
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'A+':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'A':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'B':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'C':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'D':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('won') || statusLower.includes('completed')) {
    return 'bg-green-100 text-green-800'
  }
  if (statusLower.includes('lost') || statusLower.includes('cancelled')) {
    return 'bg-red-100 text-red-800'
  }
  if (statusLower.includes('pending') || statusLower.includes('in progress')) {
    return 'bg-yellow-100 text-yellow-800'
  }
  return 'bg-blue-100 text-blue-800'
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  data,
  loading = false,
  className
}) => {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      let comparison = 0
      
      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortField, sortDirection])

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="size-4 text-gray-400" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="size-4 text-primary" />
      : <ArrowDown className="size-4 text-primary" />
  }

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Calendar className="mx-auto mb-4 size-12 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          No activities found for the selected account manager and time period.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-32">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('date')}
                className="h-8 px-2 font-semibold"
              >
                Date
                {getSortIcon('date')}
              </Button>
            </TableHead>
            <TableHead className="w-36">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('type')}
                className="h-8 px-2 font-semibold"
              >
                Type
                {getSortIcon('type')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('principal')}
                className="h-8 px-2 font-semibold"
              >
                Principal/Company
                {getSortIcon('principal')}
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="w-32 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('value')}
                className="h-8 px-2 font-semibold"
              >
                Value/Priority
                {getSortIcon('value')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('status')}
                className="h-8 px-2 font-semibold"
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((activity) => (
            <TableRow 
              key={activity.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-mono text-sm">
                {format(activity.date, 'MM/dd')}
                <div className="text-xs text-muted-foreground">
                  {format(activity.date, 'HH:mm')}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {getActivityIcon(activity.type)}
                  <span className="hidden sm:inline text-sm">
                    {getActivityLabel(activity.type)}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{activity.principal}</div>
                    <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <Building className="size-3 shrink-0" />
                      {activity.company}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="hidden md:table-cell">
                <div className="max-w-xs truncate text-sm">
                  {activity.description}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                {activity.value ? (
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="size-3 text-green-600" />
                    <span className="font-medium">
                      {activity.value.toLocaleString()}
                    </span>
                  </div>
                ) : activity.priority ? (
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs font-semibold", getPriorityColor(activity.priority))}
                  >
                    {activity.priority}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              
              <TableCell>
                <Badge 
                  variant="secondary"
                  className={cn("text-xs", getStatusColor(activity.status))}
                >
                  {activity.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ActivityTable