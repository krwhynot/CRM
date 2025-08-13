<template>
  <div class="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200">
    <!-- Header -->
    <div class="flex items-start justify-between p-4 pb-3">
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building class="w-5 h-5 text-white" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-gray-900 truncate">
              {{ organizationName }}
            </h3>
            <p class="text-sm text-gray-500 capitalize">
              {{ progression.organization_type?.replace('_', ' ') }}
            </p>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <RelationshipStageBadge 
          :stage="progression.current_stage"
          size="sm"
          variant="subtle"
        />
        <button
          @click="$emit('view-details')"
          class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          <ExternalLink class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <!-- Key Metrics -->
    <div class="px-4 pb-4">
      <div class="grid grid-cols-3 gap-4">
        <!-- Maturity Score -->
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900">
            {{ progression.relationship_maturity_score }}
          </div>
          <div class="text-xs text-gray-500">Maturity</div>
          <HealthScoreIndicator
            :score="progression.relationship_maturity_score"
            size="xs"
            :show-label="false"
            :show-description="false"
            class="mt-1 justify-center"
          />
        </div>
        
        <!-- Trust Level -->
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900">
            {{ progression.trust_level_score }}
          </div>
          <div class="text-xs text-gray-500">Trust</div>
          <div class="mt-1 flex justify-center">
            <div class="flex items-center gap-0.5">
              <Heart 
                v-for="i in 5" 
                :key="i"
                :class="[
                  'w-2.5 h-2.5',
                  i <= Math.round(progression.trust_level_score / 20) 
                    ? 'text-red-400 fill-current' 
                    : 'text-gray-200'
                ]"
              />
            </div>
          </div>
        </div>
        
        <!-- Milestones -->
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900">
            {{ milestonesCount }}
          </div>
          <div class="text-xs text-gray-500">Milestones</div>
          <div class="mt-1 flex justify-center">
            <Trophy class="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div v-if="showRecentActivity" class="px-4 pb-4">
      <div class="flex items-center gap-2 mb-2">
        <Activity class="w-4 h-4 text-gray-400" />
        <span class="text-sm font-medium text-gray-700">Recent Activity</span>
      </div>
      
      <div class="space-y-2">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="flex items-center gap-2 text-xs text-gray-600"
        >
          <TrustActivityTypeIcon
            :activity-type="activity.activity_type"
            :impact-level="activity.impact_on_trust"
            size="xs"
            variant="subtle"
          />
          <span class="truncate">{{ activity.title }}</span>
          <span class="text-gray-400">{{ formatTimeAgo(activity.activity_date) }}</span>
        </div>
        
        <div v-if="recentActivities.length === 0" class="text-xs text-gray-400 italic">
          No recent activities
        </div>
      </div>
    </div>
    
    <!-- Health Indicators -->
    <div class="px-4 pb-4">
      <div class="grid grid-cols-2 gap-3">
        <!-- Communication Quality -->
        <div class="flex items-center gap-2">
          <MessageCircle class="w-4 h-4 text-blue-500" />
          <div>
            <div class="text-xs font-medium text-gray-700 capitalize">
              {{ progression.response_quality.replace('_', ' ') }}
            </div>
            <div class="text-xs text-gray-500">Communication</div>
          </div>
        </div>
        
        <!-- Stakeholder Engagement -->
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-purple-500" />
          <div>
            <div class="text-xs font-medium text-gray-700">
              {{ progression.contacts_engaged_count }} contacts
            </div>
            <div class="text-xs text-gray-500">Stakeholders</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Timeline Indicator -->
    <div class="px-4 pb-4">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-1">
          <Clock class="w-3.5 h-3.5" />
          <span>{{ timeInStage }}</span>
        </div>
        <div class="flex items-center gap-1">
          <Calendar class="w-3.5 h-3.5" />
          <span>{{ lastInteraction }}</span>
        </div>
      </div>
    </div>
    
    <!-- Actions Footer -->
    <div class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-lg border-t">
      <div class="flex items-center gap-2">
        <button
          @click="$emit('add-milestone')"
          class="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          + Add Milestone
        </button>
        <button
          @click="$emit('log-activity')"
          class="text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
        >
          + Log Activity
        </button>
      </div>
      
      <div class="flex items-center gap-1">
        <button
          @click="$emit('assess-health')"
          class="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
          title="Assess Relationship Health"
        >
          <Heart class="w-4 h-4" />
        </button>
        <button
          @click="$emit('view-analytics')"
          class="p-1.5 text-gray-400 hover:text-purple-600 rounded transition-colors"
          title="View Analytics"
        >
          <BarChart3 class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import type { RelationshipProgression, TrustActivityRecord } from '@/types/relationshipProgression.types'

// Components
import RelationshipStageBadge from '../atomic/RelationshipStageBadge.vue'
import HealthScoreIndicator from '../atomic/HealthScoreIndicator.vue'
import TrustActivityTypeIcon from '../atomic/TrustActivityTypeIcon.vue'

// Lucide icons
import { 
  Building, 
  ExternalLink, 
  Heart, 
  Trophy, 
  Activity, 
  MessageCircle, 
  Users, 
  Clock, 
  Calendar,
  BarChart3
} from 'lucide-vue-next'

interface Props {
  progression: RelationshipProgression & { organization_name?: string; organization_type?: string }
  milestonesCount?: number
  recentActivities?: TrustActivityRecord[]
  showRecentActivity?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  milestonesCount: 0,
  recentActivities: () => [],
  showRecentActivity: true
})

defineEmits<{
  'view-details': []
  'add-milestone': []
  'log-activity': []
  'assess-health': []
  'view-analytics': []
}>()

const organizationName = computed(() => {
  return props.progression.organization_name || 'Unknown Organization'
})

const timeInStage = computed(() => {
  if (props.progression.last_progression_update) {
    return `${formatDistanceToNow(new Date(props.progression.last_progression_update))} in stage`
  }
  return 'Unknown time in stage'
})

const lastInteraction = computed(() => {
  if (props.progression.last_interaction_date) {
    return `Last: ${formatDistanceToNow(new Date(props.progression.last_interaction_date), { addSuffix: true })}`
  }
  return 'No recent interaction'
})

const formatTimeAgo = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}
</script>