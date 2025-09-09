import React from 'react'
import { cn } from '@/lib/utils'

interface MiniSparklineProps {
  data: number[]
  className?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  height?: number
  width?: number
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  className,
  color = 'blue',
  height = 20,
  width = 60,
}) => {
  if (!data || data.length === 0) {
    return <div className={cn('bg-muted/20 rounded', className)} style={{ height, width }} />
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1 // Avoid division by zero

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - 4) + 2
      const y = height - 2 - ((value - min) / range) * (height - 4)
      return `${x},${y}`
    })
    .join(' ')

  const colorClasses = {
    blue: 'stroke-primary',
    green: 'stroke-success',
    yellow: 'stroke-warning',
    red: 'stroke-destructive',
    gray: 'stroke-muted-foreground',
  }

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={colorClasses[color]}
      />
    </svg>
  )
}
