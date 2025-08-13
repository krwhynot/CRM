<template>
  <div class="min-h-screen bg-gray-50">
    <RelationshipProgressionDashboard
      @view-details="handleViewDetails"
      @add-milestone="handleAddMilestone"
      @log-activity="handleLogActivity"
      @assess-health="handleAssessHealth"
      @view-analytics="handleViewAnalytics"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import RelationshipProgressionDashboard from '@/components/relationshipProgression/organism/RelationshipProgressionDashboard.vue'
import type { RelationshipProgression } from '@/types/relationshipProgression.types'

const router = useRouter()

// Event handlers for dashboard actions
function handleViewDetails(progression: RelationshipProgression) {
  router.push({
    name: 'relationship-progression-details',
    params: { id: progression.id }
  })
}

function handleAddMilestone(progression: RelationshipProgression) {
  router.push({
    name: 'relationship-progression-milestone',
    params: { id: progression.id },
    query: { action: 'add' }
  })
}

function handleLogActivity(progression: RelationshipProgression) {
  router.push({
    name: 'relationship-progression-activity',
    params: { id: progression.id },
    query: { action: 'add' }
  })
}

function handleAssessHealth(progression: RelationshipProgression) {
  router.push({
    name: 'relationship-progression-health',
    params: { id: progression.id }
  })
}

function handleViewAnalytics(progression: RelationshipProgression) {
  router.push({
    name: 'relationship-progression-analytics',
    params: { id: progression.id }
  })
}
</script>