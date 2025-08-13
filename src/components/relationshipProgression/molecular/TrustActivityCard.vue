<template>
  <div class="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200">
    <!-- Header -->
    <div class="flex items-start gap-3 p-4 pb-3">
      <TrustActivityTypeIcon
        :activity-type="activity.activity_type"
        :impact-level="activity.impact_on_trust"
        size="md"
        variant="subtle"
      />
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-gray-900 truncate">
            {{ activity.title }}
          </h3>
          <div class="flex items-center gap-2">
            <TrustImpactBadge :impact="activity.impact_on_trust" />
            <span class="text-xs text-gray-500">{{ formattedDate }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 mt-1">
          <span class="text-sm text-gray-600 capitalize">
            {{ activityTypeLabel }}
          </span>
          <span class="text-xs text-gray-400">•</span>
          <span class="text-xs text-gray-500">{{ timeAgo }}</span>
        </div>
      </div>
    </div>
    
    <!-- Description -->
    <div v-if="activity.description" class="px-4 pb-3">
      <p class="text-sm text-gray-600 leading-relaxed">
        {{ activity.description }}
      </p>
    </div>
    
    <!-- Outcome -->
    <div v-if="activity.outcome_description" class="px-4 pb-3">
      <div 
        class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-md p-3 border-l-4"
        :class="outcomeBarColor"
      >
        <div class="flex items-start gap-2">
          <Target class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-xs font-medium text-blue-900 mb-1">Outcome</p>
            <p class="text-xs text-blue-800 leading-relaxed">{{ activity.outcome_description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Follow-up Required -->
    <div v-if="activity.follow_up_required" class="px-4 pb-3">
      <div class="bg-amber-50 rounded-md p-3 border-l-4 border-amber-300">
        <div class="flex items-start gap-2">
          <AlertCircle class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs font-medium text-amber-900">Follow-up Required</p>
              <span v-if="activity.follow_up_date" class="text-xs text-amber-700">
                Due: {{ formatFollowUpDate }}
              </span>
            </div>
            <p v-if="activity.follow_up_notes" class="text-xs text-amber-800">
              {{ activity.follow_up_notes }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Related Entities -->
    <div v-if="hasRelatedEntities" class="px-4 pb-3">
      <div class="flex items-center gap-3 text-xs text-gray-500">
        <div v-if="activity.contact_id" class="flex items-center gap-1">
          <User class="w-3.5 h-3.5" />
          <span>Contact linked</span>
        </div>
        <div v-if="activity.interaction_id" class="flex items-center gap-1">
          <MessageSquare class="w-3.5 h-3.5" />
          <span>Interaction linked</span>
        </div>
        <div v-if="activity.opportunity_id" class="flex items-center gap-1">
          <Briefcase class="w-3.5 h-3.5" />
          <span>Opportunity linked</span>
        </div>
      </div>
    </div>
    
    <!-- Impact Visualization -->
    <div class="px-4 pb-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-gray-700">Trust Impact</span>
        <div class="flex items-center gap-1">
          <TrustImpactVisualization :impact="activity.impact_on_trust" />
          <span class="text-xs text-gray-500 ml-1">
            {{ activity.impact_on_trust > 0 ? '+' : '' }}{{ activity.impact_on_trust }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div v-if="showActions" class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-lg border-t">
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <Clock class="w-3.5 h-3.5" />
        <span>Added {{ timeAgo }}</span>
      </div>
      
      <div class="flex items-center gap-1">
        <button
          v-if="activity.follow_up_required && !followUpCompleted"
          @click="$emit('complete-followup')"
          class="px-2 py-1 text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 rounded transition-colors"
        >
          Complete Follow-up
        </button>
        <button
          @click="$emit('edit')"
          class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          <Edit2 class="w-3.5 h-3.5" />
        </button>
        <button
          @click="$emit('delete')"
          class="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDistanceToNow, format } from 'date-fns'
import type { TrustActivityRecord } from '@/types/relationshipProgression.types'
import { TRUST_ACTIVITIES } from '@/types/relationshipProgression.types'

// Components
import TrustActivityTypeIcon from '../atomic/TrustActivityTypeIcon.vue'

// Lucide icons
import { 
  Target, 
  AlertCircle, 
  User, 
  MessageSquare, 
  Briefcase, 
  Clock, 
  Edit2, 
  Trash2,
  Minus,
  Plus
} from 'lucide-vue-next'

interface Props {
  activity: TrustActivityRecord
  showActions?: boolean
  followUpCompleted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  followUpCompleted: false
})

defineEmits<{
  'complete-followup': []
  edit: []
  delete: []
}>()

const activityTypeLabel = computed(() => {
  const config = TRUST_ACTIVITIES.find(t => t.value === props.activity.activity_type)
  return config?.label || props.activity.activity_type.replace(/_/g, ' ')
})

const formattedDate = computed(() => {
  return format(new Date(props.activity.activity_date), 'MMM d, yyyy')
})

const formatFollowUpDate = computed(() => {
  if (!props.activity.follow_up_date) return ''
  return format(new Date(props.activity.follow_up_date), 'MMM d, yyyy')
})

const timeAgo = computed(() => {
  return formatDistanceToNow(new Date(props.activity.created_at || props.activity.activity_date), { 
    addSuffix: true 
  })
})

const hasRelatedEntities = computed(() => {
  return props.activity.contact_id || 
         props.activity.interaction_id || 
         props.activity.opportunity_id
})

const outcomeBarColor = computed(() => {
  if (props.activity.impact_on_trust > 2) return 'border-green-400'
  if (props.activity.impact_on_trust > 0) return 'border-blue-400'
  if (props.activity.impact_on_trust < -2) return 'border-red-400'
  if (props.activity.impact_on_trust < 0) return 'border-orange-400'
  return 'border-gray-400'
})

// Simple trust impact badge component
const TrustImpactBadge = {
  props: ['impact'],
  template: `
    <span 
      class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded"
      :class="badgeClasses"
    >
      <component :is="icon" class="w-3 h-3" />
      {{ Math.abs(impact) }}
    </span>
  `,
  computed: {
    badgeClasses() {
      if (this.impact > 2) return 'bg-green-100 text-green-700'
      if (this.impact > 0) return 'bg-blue-100 text-blue-700'
      if (this.impact < -2) return 'bg-red-100 text-red-700'
      if (this.impact < 0) return 'bg-orange-100 text-orange-700'
      return 'bg-gray-100 text-gray-700'
    },
    icon() {
      return this.impact > 0 ? Plus : this.impact < 0 ? Minus : Minus
    }
  },
  components: { Plus, Minus }
}

// Simple trust impact visualization component
const TrustImpactVisualization = {
  props: ['impact'],
  template: `
    <div class="flex items-center gap-0.5">
      <div 
        v-for="i in 5" 
        :key="i"
        class="w-1.5 h-3 rounded-sm transition-colors"
        :class="getBarColor(i)"
      />
    </div>
  `,
  methods: {
    getBarColor(index: number) {
      const absImpact = Math.abs(this.impact)
      const isActive = index <= absImpact
      
      if (!isActive) return 'bg-gray-200'
      
      if (this.impact > 0) {
        return this.impact >= 3 ? 'bg-green-500' : 'bg-blue-500'
      } else {
        return this.impact <= -3 ? 'bg-red-500' : 'bg-orange-500'
      }
    }
  }
}

// Register local components
const components = {
  TrustImpactBadge,
  TrustImpactVisualization
}
</script>