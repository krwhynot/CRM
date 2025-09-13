import React from 'react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { semanticSpacing } from '@/styles/tokens'

import { cn } from '@/lib/utils'
interface TimelineHeaderProps {
  interactionCount: number
  onAddNew: () => void
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ interactionCount, onAddNew }) => {
  return (
    <CardHeader
      className={`flex flex-row items-center justify-between ${semanticSpacing.stackGap.zero} ${semanticSpacing.bottomGap.lg}`}
    >
      <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
        <CardTitle className={cn(semanticTypography.h4, 'font-nunito')}>
          Interaction Timeline
        </CardTitle>
        {interactionCount > 0 && (
          <Badge variant="secondary" className={semanticSpacing.leftGap.xs}>
            {interactionCount}
          </Badge>
        )}
      </div>
      <Button
        onClick={onAddNew}
        size="sm"
        className={`flex h-11 items-center ${semanticSpacing.gap.xs} md:h-9`}
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">Log Interaction</span>
        <span className="sm:hidden">Log</span>
      </Button>
    </CardHeader>
  )
}
