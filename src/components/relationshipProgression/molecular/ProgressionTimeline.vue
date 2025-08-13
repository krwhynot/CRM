<template>
  <div class="relative">
    <!-- Timeline container -->
    <div class="space-y-4">
      <div 
        v-for="(item, index) in timelineItems" 
        :key="item.id"
        class="relative flex items-start gap-4"
      >
        <!-- Timeline line -->
        <div 
          v-if="index < timelineItems.length - 1"
          class="absolute left-5 top-12 w-0.5 h-8 bg-gradient-to-b from-current to-gray-200"
          :class="item.lineColor"
        />
        
        <!-- Milestone/Activity icon -->
        <div class="relative flex-shrink-0">
          <MilestoneIcon 
            v-if="item.type === 'milestone'"
            :milestone="item.milestone"
            achieved
            size="md"
            variant="default"
          />
          <TrustActivityTypeIcon
            v-else
            :activity-type="item.activity_type"
            :impact-level="item.impact_level"
            size="md"
            variant="subtle"
          />
          
          <!-- Connection dot for activities -->
          <div 
            v-if="item.type === 'activity'"
            class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            :class="item.impactColor"
          />
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0 pb-4">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-medium text-gray-900">
                {{ item.title }}
              </h3>
              <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>{{ item.formattedDate }}</span>
                <span class="text-gray-400">•</span>
                <span class="capitalize">{{ item.typeLabel }}</span>
                <span v-if="item.significance_score" class="flex items-center gap-1">
                  <span class="text-gray-400">•</span>
                  <Star class="w-3.5 h-3.5 text-amber-500" />
                  <span>{{ item.significance_score }}/5</span>
                </span>
              </div>
            </div>
            
            <!-- Time indicator -->
            <div class="text-xs text-gray-400 text-right">
              {{ item.timeAgo }}
              <div v-if="item.daysSincePrevious" class="text-xs text-gray-400">
                +{{ item.daysSincePrevious }}d
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <p v-if="item.description" class="text-sm text-gray-600 mt-2 leading-relaxed">
            {{ item.description }}
          </p>
          
          <!-- Impact/Outcome -->
          <div v-if="item.impact_assessment || item.outcome_description" class="mt-2">
            <div 
              class="bg-gray-50 rounded-md p-3 border-l-4"
              :class="item.impactBorderColor"
            >
              <p class="text-xs text-gray-700">
                {{ item.impact_assessment || item.outcome_description }}
              </p>
            </div>
          </div>
          
          <!-- Next steps -->
          <div v-if="item.next_steps" class="mt-2">
            <div class="bg-blue-50 rounded-md p-3 border-l-4 border-blue-300">
              <div class="flex items-start gap-2">
                <ArrowRight class="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p class="text-xs text-blue-800">{{ item.next_steps }}</p>
              </div>
            </div>
          </div>
          
          <!-- Related entities -->
          <div v-if="item.hasRelatedEntities" class="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <div v-if="item.contact_linked" class="flex items-center gap-1">
              <User class="w-3 h-3" />
              <span>Contact</span>
            </div>
            <div v-if="item.interaction_linked" class="flex items-center gap-1">
              <MessageSquare class="w-3 h-3" />
              <span>Interaction</span>
            </div>
            <div v-if="item.opportunity_linked" class="flex items-center gap-1">
              <Target class="w-3 h-3" />
              <span>Opportunity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-if="timelineItems.length === 0" class="text-center py-12">
      <Clock class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No milestones or activities recorded yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow, format, differenceInDays } from 'date-fns'
import type { RelationshipMilestone, TrustActivityRecord } from '@/types/relationshipProgression.types'
import { PROGRESSION_MILESTONES, TRUST_ACTIVITIES } from '@/types/relationshipProgression.types'

// Components
import MilestoneIcon from '../atomic/MilestoneIcon.vue'
import TrustActivityTypeIcon from '../atomic/TrustActivityTypeIcon.vue'

// Lucide icons
import { 
  Star, 
  ArrowRight, 
  User, 
  MessageSquare, 
  Target, 
  Clock 
} from 'lucide-vue-next'

interface Props {
  milestones: RelationshipMilestone[]
  trustActivities: TrustActivityRecord[]
  showActivities?: boolean
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  showActivities: true,
  limit: 0
})

interface TimelineItem {
  id: string
  type: 'milestone' | 'activity'
  date: Date
  title: string
  description?: string
  formattedDate: string
  timeAgo: string
  typeLabel: string
  daysSincePrevious?: number
  lineColor: string
  impactColor?: string
  impactBorderColor?: string
  
  // Milestone specific
  milestone?: string
  significance_score?: number
  impact_assessment?: string
  next_steps?: string
  
  // Activity specific
  activity_type?: string
  impact_level?: number
  outcome_description?: string
  
  // Related entities
  contact_linked?: boolean
  interaction_linked?: boolean
  opportunity_linked?: boolean
  hasRelatedEntities: boolean
}

const timelineItems = computed(() => {
  const items: TimelineItem[] = []
  
  // Add milestones
  props.milestones.forEach(milestone => {
    const milestoneConfig = PROGRESSION_MILESTONES.find(m => m.value === milestone.milestone)
    
    items.push({
      id: `milestone-${milestone.id}`,
      type: 'milestone',
      date: new Date(milestone.achieved_date),
      title: milestoneConfig?.label || milestone.milestone.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: milestone.milestone_description,
      formattedDate: format(new Date(milestone.achieved_date), 'MMM d, yyyy'),
      timeAgo: formatDistanceToNow(new Date(milestone.achieved_date), { addSuffix: true }),
      typeLabel: 'milestone',
      lineColor: getMilestoneLineColor(milestoneConfig?.category || 'initial'),
      milestone: milestone.milestone,
      significance_score: milestone.significance_score,
      impact_assessment: milestone.impact_assessment,
      next_steps: milestone.next_steps,
      contact_linked: !!milestone.contact_id,
      interaction_linked: !!milestone.interaction_id,
      opportunity_linked: !!milestone.opportunity_id,
      hasRelatedEntities: !!(milestone.contact_id || milestone.interaction_id || milestone.opportunity_id)
    })
  })
  
  // Add trust activities if enabled
  if (props.showActivities) {
    props.trustActivities.forEach(activity => {
      const activityConfig = TRUST_ACTIVITIES.find(a => a.value === activity.activity_type)
      
      items.push({
        id: `activity-${activity.id}`,
        type: 'activity',
        date: new Date(activity.activity_date),
        title: activity.title,
        description: activity.description,
        formattedDate: format(new Date(activity.activity_date), 'MMM d, yyyy'),
        timeAgo: formatDistanceToNow(new Date(activity.activity_date), { addSuffix: true }),
        typeLabel: activityConfig?.label || activity.activity_type.replace(/_/g, ' '),
        lineColor: getActivityLineColor(activity.impact_on_trust),
        impactColor: getActivityImpactColor(activity.impact_on_trust),
        impactBorderColor: getActivityBorderColor(activity.impact_on_trust),
        activity_type: activity.activity_type,
        impact_level: activity.impact_on_trust,
        outcome_description: activity.outcome_description,
        contact_linked: !!activity.contact_id,
        interaction_linked: !!activity.interaction_id,
        opportunity_linked: !!activity.opportunity_id,
        hasRelatedEntities: !!(activity.contact_id || activity.interaction_id || activity.opportunity_id)
      })
    })
  }
  
  // Sort by date (most recent first)
  items.sort((a, b) => b.date.getTime() - a.date.getTime())
  
  // Calculate days since previous item
  for (let i = 0; i < items.length - 1; i++) {
    const current = items[i]
    const next = items[i + 1]
    current.daysSincePrevious = differenceInDays(current.date, next.date)
  }
  
  // Apply limit if specified
  return props.limit > 0 ? items.slice(0, props.limit) : items
})

function getMilestoneLineColor(category: string): string {
  const colors = {
    initial: 'text-slate-400',
    building: 'text-blue-400',
    partnership: 'text-purple-400',
    formal: 'text-green-400'
  }
  return colors[category] || colors.initial
}

function getActivityLineColor(impact: number): string {
  if (impact > 2) return 'text-green-400'
  if (impact > 0) return 'text-blue-400'
  if (impact < -2) return 'text-red-400'
  if (impact < 0) return 'text-orange-400'
  return 'text-gray-400'
}

function getActivityImpactColor(impact: number): string {
  if (impact > 2) return 'bg-green-500'
  if (impact > 0) return 'bg-blue-500'
  if (impact < -2) return 'bg-red-500'
  if (impact < 0) return 'bg-orange-500'
  return 'bg-gray-500'
}

function getActivityBorderColor(impact: number): string {
  if (impact > 2) return 'border-green-300'
  if (impact > 0) return 'border-blue-300'
  if (impact < -2) return 'border-red-300'
  if (impact < 0) return 'border-orange-300'
  return 'border-gray-300'
}
</script>