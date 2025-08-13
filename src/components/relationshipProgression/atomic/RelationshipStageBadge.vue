<template>
  <span 
    :class="badgeClasses"
    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md"
  >
    <component 
      v-if="showIcon" 
      :is="stageIcon" 
      class="w-3.5 h-3.5"
      :class="iconClasses" 
    />
    {{ stageLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RelationshipStage } from '@/types/relationshipProgression.types'

// Lucide icons
import { 
  Handshake, 
  Heart, 
  Users, 
  Target,
  Circle
} from 'lucide-vue-next'

interface Props {
  stage: RelationshipStage
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'minimal'
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  size: 'md',
  variant: 'default'
})

// Stage configuration with colors and icons
const stageConfig = computed(() => {
  const configs = {
    initial_contact: {
      label: 'Initial Contact',
      icon: Handshake,
      colors: {
        default: 'bg-slate-100 text-slate-800 border-slate-200',
        outline: 'bg-transparent text-slate-700 border-slate-300',
        minimal: 'bg-transparent text-slate-600'
      },
      iconColor: 'text-slate-600'
    },
    trust_building: {
      label: 'Trust Building',
      icon: Heart,
      colors: {
        default: 'bg-blue-100 text-blue-800 border-blue-200',
        outline: 'bg-transparent text-blue-700 border-blue-300',
        minimal: 'bg-transparent text-blue-600'
      },
      iconColor: 'text-blue-600'
    },
    partnership_deepening: {
      label: 'Partnership Deepening',
      icon: Users,
      colors: {
        default: 'bg-purple-100 text-purple-800 border-purple-200',
        outline: 'bg-transparent text-purple-700 border-purple-300',
        minimal: 'bg-transparent text-purple-600'
      },
      iconColor: 'text-purple-600'
    },
    strategic_collaboration: {
      label: 'Strategic Collaboration',
      icon: Target,
      colors: {
        default: 'bg-green-100 text-green-800 border-green-200',
        outline: 'bg-transparent text-green-700 border-green-300',
        minimal: 'bg-transparent text-green-600'
      },
      iconColor: 'text-green-600'
    }
  }
  
  return configs[props.stage] || {
    label: 'Unknown Stage',
    icon: Circle,
    colors: {
      default: 'bg-gray-100 text-gray-800 border-gray-200',
      outline: 'bg-transparent text-gray-700 border-gray-300',
      minimal: 'bg-transparent text-gray-600'
    },
    iconColor: 'text-gray-600'
  }
})

const stageLabel = computed(() => stageConfig.value.label)
const stageIcon = computed(() => stageConfig.value.icon)

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors'
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }
  const colorClasses = stageConfig.value.colors[props.variant]
  const borderClass = props.variant === 'outline' ? 'border' : ''
  
  return [baseClasses, sizeClasses[props.size], colorClasses, borderClass].filter(Boolean).join(' ')
})

const iconClasses = computed(() => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }
  
  return [sizeClasses[props.size], stageConfig.value.iconColor].join(' ')
})
</script>