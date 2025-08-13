<!--
  Action Icon Component
  
  Atomic component that displays contextual icons for different action types
  Used in next best actions and recommendations
-->
<template>
  <component 
    :is="actionIcon" 
    :class="iconColorClass"
    class="inline-block"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  HeartHandshakeIcon,
  MessageSquareIcon,
  TargetIcon
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  actionType: string
}>()

// Computed icon component based on action type
const actionIcon = computed(() => {
  const actionType = props.actionType.toLowerCase()
  
  if (actionType.includes('call') || actionType.includes('phone')) {
    return PhoneIcon
  }
  if (actionType.includes('email') || actionType.includes('mail')) {
    return MailIcon
  }
  if (actionType.includes('meeting') || actionType.includes('schedule')) {
    return CalendarIcon
  }
  if (actionType.includes('contact') || actionType.includes('reach')) {
    return UserIcon
  }
  if (actionType.includes('follow') || actionType.includes('update')) {
    return MessageSquareIcon
  }
  if (actionType.includes('proposal') || actionType.includes('document')) {
    return FileTextIcon
  }
  if (actionType.includes('opportunity') || actionType.includes('growth')) {
    return TrendingUpIcon
  }
  if (actionType.includes('risk') || actionType.includes('escalate')) {
    return AlertTriangleIcon
  }
  if (actionType.includes('relationship') || actionType.includes('trust')) {
    return HeartHandshakeIcon
  }
  if (actionType.includes('goal') || actionType.includes('target')) {
    return TargetIcon
  }
  
  // Default icon
  return MessageSquareIcon
})

// Computed color classes based on action type
const iconColorClass = computed(() => {
  const actionType = props.actionType.toLowerCase()
  
  if (actionType.includes('risk') || actionType.includes('escalate')) {
    return 'text-red-500'
  }
  if (actionType.includes('opportunity') || actionType.includes('growth')) {
    return 'text-green-500'
  }
  if (actionType.includes('urgent') || actionType.includes('immediate')) {
    return 'text-orange-500'
  }
  
  return 'text-blue-500'
})
</script>