<template>
  <div 
    class="inline-flex items-center justify-center rounded-lg"
    :class="[containerClasses, impactClasses]"
    :title="activityConfig.label"
  >
    <component 
      :is="activityConfig.icon" 
      :class="iconClasses"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TrustActivity } from '@/types/relationshipProgression.types'

// Lucide icons
import { 
  BookOpen, 
  Wrench, 
  Coffee, 
  Target, 
  Star, 
  ThumbsUp, 
  TrendingUp, 
  GraduationCap,
  Brain
} from 'lucide-vue-next'

interface Props {
  activityType: TrustActivity
  impactLevel?: number // -5 to +5
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle' | 'minimal'
}

const props = withDefaults(defineProps<Props>(), {
  impactLevel: 0,
  size: 'md',
  variant: 'default'
})

// Activity type configuration with icons and colors
const activityConfig = computed(() => {
  const configs = {
    knowledge_sharing: {
      icon: BookOpen,
      label: 'Knowledge Sharing',
      baseColor: 'blue'
    },
    problem_solving: {
      icon: Wrench,
      label: 'Problem Solving',
      baseColor: 'orange'
    },
    relationship_building: {
      icon: Coffee,
      label: 'Relationship Building',
      baseColor: 'pink'
    },
    strategic_planning: {
      icon: Target,
      label: 'Strategic Planning',
      baseColor: 'purple'
    },
    capability_demonstration: {
      icon: Star,
      label: 'Capability Demonstration',
      baseColor: 'indigo'
    },
    reference_providing: {
      icon: ThumbsUp,
      label: 'Reference Providing',
      baseColor: 'green'
    },
    market_intelligence: {
      icon: TrendingUp,
      label: 'Market Intelligence',
      baseColor: 'teal'
    },
    educational_content: {
      icon: GraduationCap,
      label: 'Educational Content',
      baseColor: 'cyan'
    }
  }
  
  return configs[props.activityType] || {
    icon: Brain,
    label: 'Unknown Activity',
    baseColor: 'gray'
  }
})

// Size classes
const sizeClasses = computed(() => {
  const configs = {
    xs: {
      container: 'w-7 h-7',
      icon: 'w-3.5 h-3.5'
    },
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4'
    },
    md: {
      container: 'w-10 h-10',
      icon: 'w-5 h-5'
    },
    lg: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6'
    }
  }
  
  return configs[props.size]
})

const containerClasses = computed(() => sizeClasses.value.container)
const iconClasses = computed(() => sizeClasses.value.icon)

// Impact-based styling
const impactClasses = computed(() => {
  const baseColor = activityConfig.value.baseColor
  const impact = props.impactLevel
  
  // Determine impact level
  let impactCategory: 'negative' | 'neutral' | 'positive'
  if (impact < -1) impactCategory = 'negative'
  else if (impact > 1) impactCategory = 'positive'
  else impactCategory = 'neutral'
  
  // Color intensity based on absolute impact
  const intensity = Math.min(Math.abs(impact), 5)
  let intensityLevel: 'light' | 'medium' | 'strong'
  if (intensity <= 1) intensityLevel = 'light'
  else if (intensity <= 3) intensityLevel = 'medium'
  else intensityLevel = 'strong'
  
  if (props.variant === 'minimal') {
    return `text-${baseColor}-600`
  }
  
  if (props.variant === 'subtle') {
    const colorMap = {
      negative: {
        light: `bg-red-50 text-red-600`,
        medium: `bg-red-100 text-red-700`,
        strong: `bg-red-200 text-red-800`
      },
      neutral: {
        light: `bg-${baseColor}-50 text-${baseColor}-600`,
        medium: `bg-${baseColor}-100 text-${baseColor}-700`,
        strong: `bg-${baseColor}-200 text-${baseColor}-800`
      },
      positive: {
        light: `bg-green-50 text-green-600`,
        medium: `bg-green-100 text-green-700`,
        strong: `bg-green-200 text-green-800`
      }
    }
    
    return colorMap[impactCategory][intensityLevel]
  }
  
  // Default variant
  const colorMap = {
    negative: {
      light: `bg-red-400 text-white`,
      medium: `bg-red-500 text-white`,
      strong: `bg-red-600 text-white`
    },
    neutral: {
      light: `bg-${baseColor}-400 text-white`,
      medium: `bg-${baseColor}-500 text-white`,
      strong: `bg-${baseColor}-600 text-white`
    },
    positive: {
      light: `bg-green-400 text-white`,
      medium: `bg-green-500 text-white`,
      strong: `bg-green-600 text-white`
    }
  }
  
  return colorMap[impactCategory][intensityLevel]
})
</script>