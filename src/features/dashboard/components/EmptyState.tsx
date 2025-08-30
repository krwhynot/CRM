import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, TrendingUp, Activity } from 'lucide-react'

interface EmptyStateProps {
  type?: 'dashboard' | 'chart' | 'activity'
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'dashboard',
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'dashboard':
        return {
          icon: <Building2 className="size-12 text-muted-foreground/50" />,
          title: title || 'Select a principal to view their activity',
          description: description || 'Choose a principal from the filter above to see opportunities, activities, and trends.',
          actionText: actionText || 'Browse Principals',
        }
      case 'chart':
        return {
          icon: <TrendingUp className="size-8 text-muted-foreground/50" />,
          title: title || 'No data available',
          description: description || 'Select filters to view chart data.',
          actionText: actionText || 'Adjust Filters',
        }
      case 'activity':
        return {
          icon: <Activity className="size-8 text-muted-foreground/50" />,
          title: title || 'No activities to display',
          description: description || 'Activities will appear here as opportunities and interactions are created.', /* ui-audit: allow */
          actionText: actionText || 'Create Activity',
        }
      default:
        return {
          icon: <Building2 className="size-12 text-muted-foreground/50" />,
          title: title || 'No data available',
          description: description || 'Data will appear here when available.',
          actionText: actionText || 'Refresh',
        }
    }
  }

  const content = getDefaultContent()

  if (type === 'chart') {
    return (
      <div className={`flex h-chart w-full items-center justify-center rounded-lg border border-dashed ${className}`}>
        <div className="text-center text-muted-foreground">
          {content.icon}
          <div className="mt-2 text-sm">{content.title}</div>
          <div className="mt-1 text-xs">{content.description}</div>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center">
          <div className="mb-4 flex justify-center">
            {content.icon}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {content.title}
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            {content.description}
          </p>
          {onAction && (
            <Button onClick={onAction} variant="outline">
              {content.actionText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const ChartEmptyState: React.FC<{ title?: string; description?: string }> = ({ 
  title = "No data available", 
  description = "Select filters to view activity" 
}) => {
  return (
    <div className="flex h-chart w-full items-center justify-center rounded-lg border border-dashed">
      <div className="text-center text-muted-foreground">
        <TrendingUp className="mx-auto mb-2 size-8 text-muted-foreground/50" />
        <div className="text-sm">{title}</div>
        <div className="mt-1 text-xs">{description}</div>
      </div>
    </div>
  )
}

export const ActivityEmptyState: React.FC<{ title?: string; description?: string }> = ({ 
  title = "No activities to display", 
  description = "Select a principal to view their activity" 
}) => {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <Activity className="mx-auto mb-2 size-8 text-muted-foreground/50" />
      <div className="text-sm">{title}</div>
      <div className="mt-1 text-xs">{description}</div>
    </div>
  )
}