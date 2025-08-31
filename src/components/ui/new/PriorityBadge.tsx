import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react'

type PriorityLevel = 'high' | 'medium' | 'low'
type GradeLevel = 'A+' | 'A' | 'B' | 'C' | 'D'
type PriorityType = PriorityLevel | GradeLevel

interface PriorityBadgeProps {
  priority: PriorityType
  className?: string
  showIcon?: boolean
}

export const PriorityBadge = ({ priority, className, showIcon = true }: PriorityBadgeProps) => {
  // Mapping function from grades to priority levels
  const mapGradeToPriority = (grade: GradeLevel): PriorityLevel => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'high'
      case 'B':
        return 'medium'
      case 'C':
      case 'D':
        return 'low'
      default:
        return 'low'
    }
  }

  // Determine if priority is a grade or priority level
  const isGrade = (value: PriorityType): value is GradeLevel => {
    return ['A+', 'A', 'B', 'C', 'D'].includes(value as GradeLevel)
  }

  // Get the effective priority level for variant mapping
  const getEffectivePriority = (): PriorityLevel => {
    if (isGrade(priority)) {
      return mapGradeToPriority(priority)
    }
    return priority as PriorityLevel
  }

  // Get badge variant based on effective priority
  const getVariant = () => {
    const effectivePriority = getEffectivePriority()
    switch (effectivePriority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Get appropriate icon based on priority/grade
  const getIcon = () => {
    if (!showIcon) return null

    const effectivePriority = getEffectivePriority()
    const iconClass = 'w-3 h-3 mr-1'

    switch (effectivePriority) {
      case 'high':
        return <AlertTriangle className={iconClass} />
      case 'medium':
        return <Minus className={iconClass} />
      case 'low':
        return <ArrowDown className={iconClass} />
      default:
        return null
    }
  }

  return (
    <Badge variant={getVariant()} className={cn('capitalize flex items-center', className)}>
      {getIcon()}
      {priority}
    </Badge>
  )
}
