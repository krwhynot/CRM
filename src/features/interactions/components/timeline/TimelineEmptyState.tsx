import React from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus } from 'lucide-react'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

import { cn } from '@/lib/utils'
interface TimelineEmptyStateProps {
  onAddNew: () => void
}

export const TimelineEmptyState: React.FC<TimelineEmptyStateProps> = ({ onAddNew }) => {
  return (
    <div
      className={`${semanticSpacing.stack.lg} ${semanticSpacing.layoutPadding.xxxl} text-center`}
    >
      <MessageSquare className="mx-auto size-12 text-gray-400" />
      <h3 className={cn(semanticTypography.label, semanticTypography.body, 'text-gray-900')}>
        No interactions logged yet
      </h3>
      <p className={`${semanticTypography.body} text-gray-500`}>
        Start tracking customer interactions for this opportunity
      </p>
      <Button onClick={onAddNew} variant="outline" className={semanticSpacing.topGap.lg}>
        <Plus className={`${semanticSpacing.rightGap.xs} size-4`} />
        Log First Interaction
      </Button>
    </div>
  )
}
