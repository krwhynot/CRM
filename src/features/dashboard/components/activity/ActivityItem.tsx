import React from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { buildActivityContext, formatActivityDuration } from '@/lib/activity-utils'
import type { InteractionWithRelations } from '@/types/entities'
import { ACTIVITY_CONFIG } from './ActivityConfig'

interface ActivityItemProps {
  activity: InteractionWithRelations
  onClick?: (activity: InteractionWithRelations) => void
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
  const config = ACTIVITY_CONFIG[activity.type]
  const Icon = config.icon

  const handleClick = () => {
    onClick?.(activity)
  }

  // Build context information
  const contextInfo = buildActivityContext(activity)

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={handleClick}
    >
      {/* Activity Icon */}
      <div
        className={`size-8 shrink-0 rounded-full ${config.lightColor} flex items-center justify-center`}
      >
        <Icon className={`size-4 ${config.textColor}`} />
      </div>

      {/* Activity Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{activity.subject}</p>

            {/* Context Information */}
            {contextInfo.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-1">
                {contextInfo.map((info, index) => (
                  <React.Fragment key={index}>
                    <span className="text-xs text-gray-500">{info}</span>
                    {index < contextInfo.length - 1 && (
                      <span className="text-xs text-gray-300">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Description */}
            {activity.description && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-600">{activity.description}</p>
            )}

            {/* Activity Metadata */}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {config.label}
              </Badge>

              {activity.duration_minutes && (
                <span className="text-xs text-gray-500">
                  {formatActivityDuration(activity.duration_minutes)}
                </span>
              )}

              {activity.follow_up_required && (
                <Badge variant="outline" status="pending" className="text-xs">
                  Follow-up Required
                </Badge>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="ml-2 shrink-0">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(parseISO(activity.interaction_date), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
