<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <router-link 
            to="/relationships/progression" 
            class="hover:text-gray-700 transition-colors"
          >
            Relationship Progression
          </router-link>
          <ChevronRight class="w-4 h-4" />
          <span class="font-medium text-gray-900">
            {{ organizationName }}
          </span>
        </nav>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ organizationName }}
            </h1>
            <p class="text-gray-600 mt-1">
              Relationship progression details and analytics
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <RelationshipStageBadge 
              :stage="progression?.current_stage"
              size="lg"
              variant="default"
            />
            <router-link
              :to="{ 
                name: 'relationship-progression-analytics', 
                params: { id: progressionId } 
              }"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Analytics
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-2">
          <RefreshCw class="w-5 h-5 animate-spin text-blue-500" />
          <span class="text-gray-600">Loading relationship details...</span>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-gray-900 font-medium mb-2">Failed to load relationship details</p>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button
          @click="refreshData"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
      
      <!-- Main Content -->
      <div v-else-if="progression" class="space-y-8">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Maturity Score</p>
                <p class="text-3xl font-bold text-gray-900">
                  {{ progression.relationship_maturity_score }}
                </p>
              </div>
              <HealthScoreIndicator
                :score="progression.relationship_maturity_score"
                size="md"
                :show-label="false"
              />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Trust Level</p>
                <p class="text-3xl font-bold text-gray-900">
                  {{ progression.trust_level_score }}
                </p>
              </div>
              <div class="flex items-center gap-0.5">
                <Heart 
                  v-for="i in 5" 
                  :key="i"
                  :class="[
                    'w-4 h-4',
                    i <= Math.round(progression.trust_level_score / 20) 
                      ? 'text-red-400 fill-current' 
                      : 'text-gray-200'
                  ]"
                />
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Milestones</p>
                <p class="text-3xl font-bold text-gray-900">
                  {{ milestones.length }}
                </p>
              </div>
              <Trophy class="w-8 h-8 text-amber-500" />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Activities</p>
                <p class="text-3xl font-bold text-gray-900">
                  {{ trustActivities.length }}
                </p>
              </div>
              <Activity class="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
        
        <!-- Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column: Timeline -->
          <div class="space-y-6">
            <div class="bg-white rounded-lg border p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-semibold text-gray-900">
                  Progression Timeline
                </h2>
                <div class="flex items-center gap-2">
                  <button
                    @click="showAddMilestone"
                    class="px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                  >
                    + Milestone
                  </button>
                  <button
                    @click="showLogActivity"
                    class="px-3 py-1 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors"
                  >
                    + Activity
                  </button>
                </div>
              </div>
              
              <ProgressionTimeline
                :milestones="milestones"
                :trust-activities="trustActivities"
                :limit="10"
              />
            </div>
          </div>
          
          <!-- Right Column: Details -->
          <div class="space-y-6">
            <!-- Relationship Overview -->
            <div class="bg-white rounded-lg border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Relationship Overview
              </h3>
              
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Current Stage</span>
                  <RelationshipStageBadge 
                    :stage="progression.current_stage"
                    size="sm"
                  />
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Time in Stage</span>
                  <span class="text-sm text-gray-900">
                    {{ formatTimeInStage(progression.last_progression_update) }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Last Interaction</span>
                  <span class="text-sm text-gray-900">
                    {{ formatLastInteraction(progression.last_interaction_date) }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Communication Quality</span>
                  <span class="text-sm text-gray-900 capitalize">
                    {{ progression.response_quality.replace('_', ' ') }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Contacts Engaged</span>
                  <span class="text-sm text-gray-900">
                    {{ progression.contacts_engaged_count }} contacts
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Recent Milestones -->
            <div class="bg-white rounded-lg border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Recent Milestones
              </h3>
              
              <div class="space-y-3">
                <MilestoneCard
                  v-for="milestone in recentMilestones"
                  :key="milestone.id"
                  :milestone="milestone"
                  :compact="true"
                />
                
                <div v-if="recentMilestones.length === 0" class="text-center py-8">
                  <Trophy class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p class="text-gray-500">No milestones recorded yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { useRelationshipProgressionStore } from '@/stores/relationshipProgressionStore'
import { useOrganizationStore } from '@/stores/organizationStore'

// Components
import RelationshipStageBadge from '@/components/relationshipProgression/atomic/RelationshipStageBadge.vue'
import HealthScoreIndicator from '@/components/relationshipProgression/atomic/HealthScoreIndicator.vue'
import ProgressionTimeline from '@/components/relationshipProgression/molecular/ProgressionTimeline.vue'
import MilestoneCard from '@/components/relationshipProgression/molecular/MilestoneCard.vue'

// Lucide icons
import { 
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Heart,
  Trophy,
  Activity
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const progressionStore = useRelationshipProgressionStore()
const organizationStore = useOrganizationStore()

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)

// Route params
const progressionId = computed(() => route.params.id as string)

// Computed data from store
const progression = computed(() => {
  return progressionStore.progressions.find(p => p.id === progressionId.value)
})

const organization = computed(() => {
  if (!progression.value) return null
  return organizationStore.organizations.find(org => org.id === progression.value!.organization_id)
})

const organizationName = computed(() => {
  return organization.value?.name || 'Unknown Organization'
})

const milestones = computed(() => {
  return progressionStore.getMilestonesForProgression(progressionId.value)
})

const trustActivities = computed(() => {
  return progressionStore.getTrustActivitiesForProgression(progressionId.value)
})

const recentMilestones = computed(() => {
  return milestones.value.slice(0, 3)
})

// Methods
async function refreshData() {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      progressionStore.fetchProgressions(),
      organizationStore.fetchOrganizations(),
      progressionStore.fetchMilestones(),
      progressionStore.fetchTrustActivities()
    ])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    console.error('Failed to refresh data:', err)
  } finally {
    loading.value = false
  }
}

function formatTimeInStage(dateString: string | undefined) {
  if (!dateString) return 'Unknown'
  return formatDistanceToNow(new Date(dateString))
}

function formatLastInteraction(dateString: string | undefined) {
  if (!dateString) return 'No recent interaction'
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

function showAddMilestone() {
  router.push({
    name: 'relationship-progression-milestone',
    params: { id: progressionId.value },
    query: { action: 'add' }
  })
}

function showLogActivity() {
  router.push({
    name: 'relationship-progression-activity',
    params: { id: progressionId.value },
    query: { action: 'add' }
  })
}

// Initialize data on mount
onMounted(async () => {
  if (!progression.value || milestones.value.length === 0 || trustActivities.value.length === 0) {
    await refreshData()
  }
})
</script>