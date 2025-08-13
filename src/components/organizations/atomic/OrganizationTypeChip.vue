<template>
  <span 
    :class="chipClasses"
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
  >
    <component 
      :is="typeIcon" 
      class="w-3 h-3 mr-1" 
      v-if="showIcon"
    />
    {{ typeLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrganizationType } from '@/types'

interface Props {
  type: OrganizationType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true
})

// Type-specific styling and labels
const typeConfig = computed(() => {
  const configs = {
    customer: {
      label: 'Customer',
      classes: 'bg-emerald-100 text-emerald-800',
      icon: 'UserGroupIcon'
    },
    principal: {
      label: 'Principal',
      classes: 'bg-blue-100 text-blue-800',
      icon: 'BuildingOfficeIcon'
    },
    distributor: {
      label: 'Distributor',
      classes: 'bg-violet-100 text-violet-800',
      icon: 'TruckIcon'
    },
    prospect: {
      label: 'Prospect',
      classes: 'bg-amber-100 text-amber-800',
      icon: 'EyeIcon'
    },
    vendor: {
      label: 'Vendor',
      classes: 'bg-gray-100 text-gray-800',
      icon: 'CubeIcon'
    }
  }
  
  return configs[props.type] || configs.vendor
})

const typeLabel = computed(() => typeConfig.value.label)

const chipClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  }
  
  return [
    typeConfig.value.classes,
    sizeClasses[props.size]
  ].join(' ')
})

// Simple icon components (using CSS shapes instead of Heroicons for now)
const typeIcon = computed(() => {
  // For now, we'll use simple CSS-based icons
  // In a real implementation, you'd import proper icon components
  return 'div'
})
</script>

<style scoped>
/* Simple CSS-based icons as placeholders */
.icon-customer::before { content: '👥'; }
.icon-principal::before { content: '🏢'; }
.icon-distributor::before { content: '🚛'; }
.icon-prospect::before { content: '👁️'; }
.icon-vendor::before { content: '📦'; }
</style>