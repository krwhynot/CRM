import React from 'react'
import { cn } from '@/lib/utils'

interface InteractionTimelineDotProps {
  type: string
  getInteractionIcon: (type: string) => React.ReactNode
  getInteractionTypeColor: (type: string) => string
}

export const InteractionTimelineDot: React.FC<InteractionTimelineDotProps> = ({
  type,
  getInteractionIcon,
  getInteractionTypeColor,
}) => {
  const colorClass = getInteractionTypeColor(type)

  return (
    <div className="relative z-10 shrink-0">
      <div
        className={cn(
          'w-8 h-8 rounded-full border-2 bg-background flex items-center justify-center',
          'shadow-sm group-hover:shadow-md transition-shadow',
          colorClass.includes('blue') && 'border-primary/20',
          colorClass.includes('green') && 'border-success/20',
          colorClass.includes('purple') && 'border-accent/20',
          colorClass.includes('orange') && 'border-warning/20',
          colorClass.includes('red') && 'border-destructive/20',
          colorClass.includes('yellow') && 'border-warning/20',
          colorClass.includes('pink') && 'border-accent/20',
          colorClass.includes('indigo') && 'border-info/20',
          !colorClass.match(/(blue|green|purple|orange|red|yellow|pink|indigo)/) && 'border-border'
        )}
      >
        {getInteractionIcon(type)}
      </div>
    </div>
  )
}
