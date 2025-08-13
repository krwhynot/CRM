<template>
  <div 
    :class="avatarClasses"
    :title="`${organization.name} (${organization.type})`"
  >
    <img
      v-if="organization.website"
      :src="`https://logo.clearbit.com/${organization.website.replace(/^https?:\/\//, '')}`"
      :alt="`${organization.name} logo`"
      class="w-full h-full object-cover"
      @error="(event) => { const target = event.target as HTMLImageElement; if (target) target.style.display = 'none'; }"
    />
    <div 
      v-else
      class="flex items-center justify-center h-full w-full text-white font-semibold"
      :style="{ backgroundColor: typeColor }"
    >
      {{ initials }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Organization } from '@/types'

interface Props {
  organization: Organization
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showBorder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showBorder: false
})

// Generate initials from organization name
const initials = computed(() => {
  const words = props.organization.name.split(' ')
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
})

// Get color based on organization type
const typeColor = computed(() => {
  const colorMap = {
    customer: '#10B981',    // emerald-500
    principal: '#3B82F6',   // blue-500
    distributor: '#8B5CF6', // violet-500
    prospect: '#F59E0B',    // amber-500
    vendor: '#6B7280'       // gray-500
  }
  return colorMap[props.organization.type] || colorMap.vendor
})

// Dynamic classes for avatar size and styling
const avatarClasses = computed(() => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }
  
  return [
    'rounded-full overflow-hidden flex-shrink-0',
    sizeClasses[props.size],
    props.showBorder ? 'border-2 border-white shadow-sm' : '',
  ].filter(Boolean).join(' ')
})
</script>