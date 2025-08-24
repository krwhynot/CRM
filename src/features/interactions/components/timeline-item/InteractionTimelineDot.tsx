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
  getInteractionTypeColor
}) => {
  const colorClass = getInteractionTypeColor(type)
  
  return (
    <div className="relative z-10 flex-shrink-0">
      <div 
        className={cn(
          'w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center',
          'shadow-sm group-hover:shadow-md transition-shadow',
          colorClass.includes('blue') && 'border-blue-200',
          colorClass.includes('green') && 'border-green-200',
          colorClass.includes('purple') && 'border-purple-200',
          colorClass.includes('orange') && 'border-orange-200',
          colorClass.includes('red') && 'border-red-200',
          colorClass.includes('yellow') && 'border-yellow-200',
          colorClass.includes('pink') && 'border-pink-200',
          colorClass.includes('indigo') && 'border-indigo-200',
          !colorClass.match(/(blue|green|purple|orange|red|yellow|pink|indigo)/) && 'border-gray-200'
        )}
      >
        {getInteractionIcon(type)}
      </div>
    </div>
  )
}