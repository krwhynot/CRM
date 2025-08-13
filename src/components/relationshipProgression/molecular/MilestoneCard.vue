<template>
  <div 
    class="bg-white rounded-lg border transition-all duration-200"
    :class="[
      cardClasses,
      {
        'shadow-sm hover:shadow-md': !achieved,
        'shadow-md border-green-200 bg-green-50/30': achieved
      }
    ]"
  >
    <!-- Header -->
    <div class="flex items-start gap-3 p-4 pb-2">
      <MilestoneIcon 
        :milestone="milestone.milestone"
        :achieved="achieved"
        size="md"
        :variant="achieved ? 'default' : 'outlined'"
      />
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-gray-900 truncate">
            {{ milestoneLabel }}
          </h3>
          <div v-if="achieved" class="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle class="w-3.5 h-3.5" />
            <span>Achieved</span>
          </div>
        </div>
        
        <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span>{{ formattedDate }}</span>
          <div v-if="milestone.significance_score" class="flex items-center gap-1">
            <Star class="w-3.5 h-3.5 text-amber-500" />
            <span>{{ milestone.significance_score }}/5</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Description -->
    <div v-if="milestone.milestone_description" class="px-4 pb-2">
      <p class="text-sm text-gray-600 leading-relaxed">
        {{ milestone.milestone_description }}
      </p>
    </div>
    
    <!-- Impact Assessment -->
    <div v-if="milestone.impact_assessment" class="px-4 pb-2">
      <div class="bg-blue-50 rounded-md p-3">
        <div class="flex items-start gap-2">
          <Lightbulb class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-xs font-medium text-blue-800 mb-1">Impact Assessment</p>
            <p class="text-xs text-blue-700">{{ milestone.impact_assessment }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Next Steps -->
    <div v-if="milestone.next_steps" class="px-4 pb-2">
      <div class="bg-purple-50 rounded-md p-3">
        <div class="flex items-start gap-2">
          <ArrowRight class="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-xs font-medium text-purple-800 mb-1">Next Steps</p>
            <p class="text-xs text-purple-700">{{ milestone.next_steps }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Related Entities -->
    <div v-if="hasRelatedEntities" class="px-4 pb-2">
      <div class="flex items-center gap-3 text-xs text-gray-500">
        <div v-if="milestone.contact_id" class="flex items-center gap-1">
          <User class="w-3.5 h-3.5" />
          <span>Contact linked</span>
        </div>
        <div v-if="milestone.interaction_id" class="flex items-center gap-1">
          <MessageSquare class="w-3.5 h-3.5" />
          <span>Interaction linked</span>
        </div>
        <div v-if="milestone.opportunity_id" class="flex items-center gap-1">
          <Target class="w-3.5 h-3.5" />
          <span>Opportunity linked</span>
        </div>
      </div>
    </div>
    
    <!-- Notes -->
    <div v-if="milestone.notes" class="px-4 pb-3">
      <details class="group">
        <summary class="flex items-center gap-1 cursor-pointer text-xs text-gray-500 hover:text-gray-700">
          <ChevronRight class="w-3.5 h-3.5 transform group-open:rotate-90 transition-transform" />
          <span>Notes</span>
        </summary>
        <div class="mt-2 pl-4 border-l-2 border-gray-100">
          <p class="text-xs text-gray-600 leading-relaxed">{{ milestone.notes }}</p>
        </div>
      </details>
    </div>
    
    <!-- Actions -->
    <div v-if="showActions" class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-lg border-t">
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <Calendar class="w-3.5 h-3.5" />
        <span>Added {{ timeAgo }}</span>
      </div>
      
      <div class="flex items-center gap-1">
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
import type { RelationshipMilestone } from '@/types/relationshipProgression.types'
import { PROGRESSION_MILESTONES } from '@/types/relationshipProgression.types'

// Components
import MilestoneIcon from '../atomic/MilestoneIcon.vue'

// Lucide icons
import { 
  CheckCircle, 
  Star, 
  Lightbulb, 
  ArrowRight, 
  User, 
  MessageSquare, 
  Target, 
  ChevronRight, 
  Calendar, 
  Edit2, 
  Trash2 
} from 'lucide-vue-next'

interface Props {
  milestone: RelationshipMilestone
  showActions?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  compact: false
})

defineEmits<{
  edit: []
  delete: []
}>()

const achieved = computed(() => true) // All milestones in the system are achieved

const milestoneLabel = computed(() => {
  const config = PROGRESSION_MILESTONES.find(m => m.value === props.milestone.milestone)
  return config?.label || props.milestone.milestone.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
})

const formattedDate = computed(() => {
  return format(new Date(props.milestone.achieved_date), 'MMM d, yyyy')
})

const timeAgo = computed(() => {
  return formatDistanceToNow(new Date(props.milestone.created_at || props.milestone.achieved_date), { 
    addSuffix: true 
  })
})

const hasRelatedEntities = computed(() => {
  return props.milestone.contact_id || 
         props.milestone.interaction_id || 
         props.milestone.opportunity_id
})

const cardClasses = computed(() => {
  if (props.compact) {
    return 'p-3'
  }
  return ''
})
</script>