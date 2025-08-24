import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuickActionsBar } from '@/components/ui/new/QuickActionsBar'
import { Plus, Search, Info } from 'lucide-react'
import { FEATURE_FLAGS, isFeatureEnabled, getFeatureMessage } from '@/lib/feature-flags'

interface InteractionTableHeaderProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddNew?: () => void
  loading?: boolean
  useNewStyle: boolean
  selectedCount?: number
  onBulkAction?: (action: string) => void
}

export const InteractionTableHeader: React.FC<InteractionTableHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddNew,
  loading = false,
  useNewStyle,
  selectedCount = 0,
  onBulkAction
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search interactions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64"
            disabled={loading}
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Interaction
          </Button>
        )}
      </div>

      {/* Quick Actions Bar - only show with new styling */}
      {useNewStyle && (
        <>
          {isFeatureEnabled('bulkOperations') ? (
            <QuickActionsBar
              onQuickAdd={onAddNew}
              selectedCount={selectedCount}
              onBulkAction={onBulkAction}
            />
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{getFeatureMessage('bulkOperations')}</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}