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
import type { ActivityItem } from '../../hooks/useEnhancedActivityData'

const ACTIVITY_ICONS = {
  opportunity: Target,
  interaction: MessageSquare, /* ui-audit: allow */
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
      className={`flex cursor-pointer items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:border-border hover:bg-muted/30 ${useNewStyle ? "p-2" : ""}`}
    >
      <div className={`shrink-0 ${useNewStyle ? "mt-0.5" : "mt-1"}`}>
        {InteractionIcon ? (
          <InteractionIcon className="size-4 text-primary" />
        ) : (
          <IconComponent className="size-4 text-primary" />
        )}
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className={`truncate font-medium ${useNewStyle ? "text-sm text-foreground" : "text-sm"}`}>
            {item.title}
          </h4>
          {item.priority && (
            <Badge 
              variant="outline" 
              className={`px-2 py-0 text-xs ${getPriorityColor(item.priority)}`}
            >
              {item.priority}
            </Badge>
          )}
        </div>
        
        <p className="mb-1 line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3" />
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