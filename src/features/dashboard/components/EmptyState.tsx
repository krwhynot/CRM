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
          icon: <Building2 className="w-12 h-12 text-muted-foreground/50" />,
          title: title || 'Select a principal to view their activity',
          description: description || 'Choose a principal from the filter above to see opportunities, interactions, and activity trends.',
          actionText: actionText || 'Browse Principals',
        }
      case 'chart':
        return {
          icon: <TrendingUp className="w-8 h-8 text-muted-foreground/50" />,
          title: title || 'No data available',
          description: description || 'Select filters to view chart data.',
          actionText: actionText || 'Adjust Filters',
        }
      case 'activity':
        return {
          icon: <Activity className="w-8 h-8 text-muted-foreground/50" />,
          title: title || 'No activities to display',
          description: description || 'Activities will appear here as opportunities and interactions are created.',
          actionText: actionText || 'Create Activity',
        }
      default:
        return {
          icon: <Building2 className="w-12 h-12 text-muted-foreground/50" />,
          title: title || 'No data available',
          description: description || 'Data will appear here when available.',
          actionText: actionText || 'Refresh',
        }
    }
  }

  const content = getDefaultContent()

  if (type === 'chart') {
    return (
      <div className={`h-[300px] w-full border border-dashed rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          {content.icon}
          <div className="text-sm mt-2">{content.title}</div>
          <div className="text-xs mt-1">{content.description}</div>
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
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {content.title}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
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
    <div className="h-[300px] w-full border border-dashed rounded-lg flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <div className="text-sm">{title}</div>
        <div className="text-xs mt-1">{description}</div>
      </div>
    </div>
  )
}

export const ActivityEmptyState: React.FC<{ title?: string; description?: string }> = ({ 
  title = "No activities to display", 
  description = "Select a principal to view their activity" 
}) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
      <div className="text-sm">{title}</div>
      <div className="text-xs mt-1">{description}</div>
    </div>
  )
}