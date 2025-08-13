<template>
  <div 
    class="inline-flex items-center justify-center rounded-full"
    :class="[containerClasses, statusClasses]"
  >
    <component 
      :is="milestoneConfig.icon" 
      :class="iconClasses"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProgressionMilestone } from '@/types/relationshipProgression.types'

// Lucide icons
import { 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle, 
  Users, 
  FileText, 
  Presentation, 
  MapPin, 
  Building, 
  Handshake, 
  FileSignature, 
  Play, 
  FileCheck, 
  Award
} from 'lucide-vue-next'

interface Props {
  milestone: ProgressionMilestone
  achieved?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle' | 'outlined'
}

const props = withDefaults(defineProps<Props>(), {
  achieved: false,
  size: 'md',
  variant: 'default'
})

// Milestone configuration with icons and categories
const milestoneConfig = computed(() => {
  const configs = {
    first_contact: {
      icon: Phone,
      category: 'initial',
      label: 'First Contact'
    },
    contact_response: {
      icon: Mail,
      category: 'initial',
      label: 'First Response'
    },
    meeting_scheduled: {
      icon: Calendar,
      category: 'initial',
      label: 'Meeting Scheduled'
    },
    meeting_completed: {
      icon: CheckCircle,
      category: 'initial',
      label: 'Meeting Completed'
    },
    stakeholder_introduction: {
      icon: Users,
      category: 'building',
      label: 'Stakeholder Introduction'
    },
    needs_assessment: {
      icon: FileText,
      category: 'building',
      label: 'Needs Assessment'
    },
    solution_presentation: {
      icon: Presentation,
      category: 'building',
      label: 'Solution Presentation'
    },
    site_visit_requested: {
      icon: MapPin,
      category: 'partnership',
      label: 'Site Visit Requested'
    },
    site_visit_completed: {
      icon: Building,
      category: 'partnership',
      label: 'Site Visit Completed'
    },
    strategic_discussion: {
      icon: Handshake,
      category: 'partnership',
      label: 'Strategic Discussion'
    },
    partnership_proposal: {
      icon: FileSignature,
      category: 'formal',
      label: 'Partnership Proposal'
    },
    trial_program: {
      icon: Play,
      category: 'formal',
      label: 'Trial Program'
    },
    contract_discussion: {
      icon: FileCheck,
      category: 'formal',
      label: 'Contract Discussion'
    },
    partnership_established: {
      icon: Award,
      category: 'formal',
      label: 'Partnership Established'
    }
  }
  
  return configs[props.milestone] || {
    icon: CheckCircle,
    category: 'initial',
    label: 'Unknown Milestone'
  }
})

// Size classes
const sizeClasses = computed(() => {
  const configs = {
    xs: {
      container: 'w-6 h-6',
      icon: 'w-3 h-3'
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

// Status-based styling
const statusClasses = computed(() => {
  const category = milestoneConfig.value.category
  
  if (props.achieved) {
    // Achieved milestone colors by category
    const achievedColors = {
      initial: 'bg-slate-500 text-white',
      building: 'bg-blue-500 text-white',
      partnership: 'bg-purple-500 text-white',
      formal: 'bg-green-500 text-white'
    }
    
    if (props.variant === 'subtle') {
      const subtleColors = {
        initial: 'bg-slate-100 text-slate-600',
        building: 'bg-blue-100 text-blue-600',
        partnership: 'bg-purple-100 text-purple-600',
        formal: 'bg-green-100 text-green-600'
      }
      return subtleColors[category]
    }
    
    if (props.variant === 'outlined') {
      const outlinedColors = {
        initial: 'border-2 border-slate-500 text-slate-500 bg-white',
        building: 'border-2 border-blue-500 text-blue-500 bg-white',
        partnership: 'border-2 border-purple-500 text-purple-500 bg-white',
        formal: 'border-2 border-green-500 text-green-500 bg-white'
      }
      return outlinedColors[category]
    }
    
    return achievedColors[category]
  } else {
    // Unachieved milestone - always gray
    if (props.variant === 'subtle') {
      return 'bg-gray-100 text-gray-400'
    }
    
    if (props.variant === 'outlined') {
      return 'border-2 border-gray-300 text-gray-400 bg-white'
    }
    
    return 'bg-gray-300 text-gray-500'
  }
})
</script>