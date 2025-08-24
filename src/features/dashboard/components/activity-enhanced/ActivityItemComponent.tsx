import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  User, 
  Building2, 
  Package, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquare,
  Heart,
  Clock,
  RefreshCw
} from 'lucide-react'
import type { ActivityItem } from '@/hooks/useEnhancedActivityData'

const ACTIVITY_ICONS = {
  opportunity: Target,
  interaction: MessageSquare,
  contact: User,
  organization: Building2,
  product: Package
}

const INTERACTION_TYPE_ICONS = {
  phone: Phone,
  email: Mail,
  meeting: Calendar,
  demo: Heart,
  follow_up: RefreshCw
}

interface ActivityItemProps {
  item: ActivityItem
  useNewStyle: boolean
  formatTimestamp: (timestamp: Date) => string
  getPriorityColor: (priority: string) => string
}

export const ActivityItemComponent: React.FC<ActivityItemProps> = ({
  item,
  useNewStyle,
  formatTimestamp,
  getPriorityColor
}) => {
  const IconComponent = ACTIVITY_ICONS[item.type]
  const InteractionIcon = item.relatedData?.icon ? 
    INTERACTION_TYPE_ICONS[item.relatedData.icon as keyof typeof INTERACTION_TYPE_ICONS] : 
    null

  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-colors cursor-pointer ${useNewStyle ? "p-2" : ""}`}
    >
      <div className={`flex-shrink-0 ${useNewStyle ? "mt-0.5" : "mt-1"}`}>
        {InteractionIcon ? (
          <InteractionIcon className="h-4 w-4 text-primary" />
        ) : (
          <IconComponent className="h-4 w-4 text-primary" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`font-medium truncate ${useNewStyle ? "text-sm text-[hsl(var(--foreground))]" : "text-sm"}`}>
            {item.title}
          </h4>
          {item.priority && (
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0 ${getPriorityColor(item.priority)}`}
            >
              {item.priority}
            </Badge>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTimestamp(item.timestamp)}</span>
          {item.status && (
            <>
              <span>•</span>
              <span className="capitalize">{item.status.replace('_', ' ')}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}