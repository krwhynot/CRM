<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <router-link 
            :to="{ 
              name: 'relationship-progression-details', 
              params: { id: progressionId } 
            }"
            class="hover:text-gray-700 transition-colors"
          >
            {{ organizationName }}
          </router-link>
          <ChevronRight class="w-4 h-4" />
          <span class="font-medium text-gray-900">
            {{ isEditing ? 'Edit Activity' : 'Log Activity' }}
          </span>
        </nav>
        
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditing ? 'Edit Trust Activity' : 'Log Trust Activity' }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ isEditing ? 'Update activity details' : 'Record a trust-building activity' }} for {{ organizationName }}
          </p>
        </div>
      </div>
      
      <!-- Form -->
      <div class="bg-white rounded-lg border shadow-sm">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Activity Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Activity Type <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.activity_type"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.activity_type ? 'border-red-300' : 'border-gray-300'
              ]"
              required
            >
              <option value="">Select an activity type</option>
              <option 
                v-for="activity in TRUST_ACTIVITIES" 
                :key="activity.value"
                :value="activity.value"
              >
                {{ activity.label }} - {{ activity.description }}
              </option>
            </select>
            <p v-if="errors.activity_type" class="mt-1 text-sm text-red-600">{{ errors.activity_type }}</p>
          </div>
          
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Activity Title <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.title ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="Brief, descriptive title for this activity"
              required
            />
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
          </div>
          
          <!-- Activity Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Activity Date <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.activity_date"
              type="date"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.activity_date ? 'border-red-300' : 'border-gray-300'
              ]"
              required
            />
            <p v-if="errors.activity_date" class="mt-1 text-sm text-red-600">{{ errors.activity_date }}</p>
          </div>
          
          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.description ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="Describe what happened, who was involved, and the context..."
              required
            />
            <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
          </div>
          
          <!-- Trust Impact -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Impact on Trust <span class="text-red-500">*</span>
            </label>
            
            <div class="space-y-4">
              <!-- Impact Scale Selector -->
              <div class="flex items-center justify-center gap-2">
                <button
                  v-for="value in [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]"
                  :key="value"
                  type="button"
                  @click="form.impact_on_trust = value"
                  :class="[
                    'w-8 h-8 rounded-full text-xs font-medium transition-all',
                    form.impact_on_trust === value
                      ? getSelectedImpactClass(value)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ value > 0 ? '+' : '' }}{{ value }}
                </button>
              </div>
              
              <!-- Impact Description -->
              <div class="text-center">
                <div class="text-sm font-medium text-gray-900">
                  {{ getImpactLabel(form.impact_on_trust) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ getImpactDescription(form.impact_on_trust) }}
                </div>
              </div>
              
              <!-- Visual Impact Indicator -->
              <div class="flex items-center justify-center">
                <TrustImpactVisualization :impact="form.impact_on_trust" />
              </div>
            </div>
            
            <p v-if="errors.impact_on_trust" class="mt-2 text-sm text-red-600">{{ errors.impact_on_trust }}</p>
          </div>
          
          <!-- Outcome -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Outcome Description
            </label>
            <textarea
              v-model="form.outcome_description"
              rows="3"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.outcome_description ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="What was the result or outcome of this activity? How did the relationship change?"
            />
            <p v-if="errors.outcome_description" class="mt-1 text-sm text-red-600">{{ errors.outcome_description }}</p>
          </div>
          
          <!-- Follow-up -->
          <div class="border-t pt-6">
            <div class="flex items-center gap-2 mb-4">
              <input
                v-model="form.follow_up_required"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label class="text-sm font-medium text-gray-700">
                Follow-up Required
              </label>
            </div>
            
            <div v-if="form.follow_up_required" class="space-y-4 pl-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  v-model="form.follow_up_date"
                  type="date"
                  class="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Notes
                </label>
                <textarea
                  v-model="form.follow_up_notes"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What specific actions need to be taken as follow-up?"
                />
              </div>
            </div>
          </div>
          
          <!-- Related Entities -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Related Information (Optional)</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Contact -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Related Contact
                </label>
                <select 
                  v-model="form.contact_id"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a contact</option>
                  <option value="contact-1">John Doe (Decision Maker)</option>
                  <option value="contact-2">Jane Smith (Influencer)</option>
                  <!-- TODO: Load from contacts store -->
                </select>
              </div>
              
              <!-- Interaction -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Related Interaction
                </label>
                <select 
                  v-model="form.interaction_id"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an interaction</option>
                  <option value="interaction-1">Executive Meeting - Q4 Strategy</option>
                  <option value="interaction-2">Product Demo - New Features</option>
                  <!-- TODO: Load from interactions store -->
                </select>
              </div>
            </div>
          </div>
          
          <!-- Form Actions -->
          <div class="flex items-center justify-between pt-6 border-t">
            <div>
              <button
                v-if="isEditing"
                type="button"
                @click="handleDelete"
                class="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                Delete Activity
              </button>
            </div>
            
            <div class="flex items-center gap-3">
              <router-link
                :to="{ 
                  name: 'relationship-progression-details', 
                  params: { id: progressionId } 
                }"
                class="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </router-link>
              
              <button
                type="submit"
                :disabled="submitting"
                :class="[
                  'px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                  submitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                ]"
              >
                <RefreshCw v-if="submitting" class="w-4 h-4 animate-spin inline mr-2" />
                {{ isEditing ? 'Update Activity' : 'Log Activity' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRelationshipProgressionStore } from '@/stores/relationshipProgressionStore'
import { useOrganizationStore } from '@/stores/organizationStore'
import { TRUST_ACTIVITIES } from '@/types/relationshipProgression.types'
import type { TrustActivityInsert } from '@/types/relationshipProgression.types'

// Lucide icons
import { ChevronRight, RefreshCw } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const progressionStore = useRelationshipProgressionStore()
const organizationStore = useOrganizationStore()

// Route params
const progressionId = computed(() => route.params.id as string)
const activityId = computed(() => route.params.activityId as string | undefined)
const isEditing = computed(() => !!activityId.value)

// Form state
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref<TrustActivityInsert>({
  relationship_progression_id: progressionId.value,
  activity_type: '',
  title: '',
  description: '',
  activity_date: new Date().toISOString().split('T')[0],
  impact_on_trust: 0,
  outcome_description: '',
  follow_up_required: false,
  follow_up_date: null,
  follow_up_notes: '',
  contact_id: null,
  interaction_id: null,
  opportunity_id: null
})

// Computed data
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

// Impact helpers
function getSelectedImpactClass(value: number) {
  if (value > 2) return 'bg-green-500 text-white'
  if (value > 0) return 'bg-blue-500 text-white'
  if (value === 0) return 'bg-gray-300 text-gray-700'
  if (value < -2) return 'bg-red-500 text-white'
  return 'bg-orange-500 text-white'
}

function getImpactLabel(value: number) {
  if (value > 3) return 'Major Trust Building'
  if (value > 1) return 'Positive Trust Impact'
  if (value > 0) return 'Minor Trust Gain'
  if (value === 0) return 'Neutral Impact'
  if (value > -2) return 'Minor Trust Loss'
  if (value > -3) return 'Negative Trust Impact'
  return 'Major Trust Damage'
}

function getImpactDescription(value: number) {
  if (value > 3) return 'Significant breakthrough that strengthens the relationship foundation'
  if (value > 1) return 'Notable positive interaction that builds confidence and rapport'
  if (value > 0) return 'Small positive step that contributes to relationship building'
  if (value === 0) return 'Routine interaction with no significant trust impact'
  if (value > -2) return 'Minor setback that requires attention but is recoverable'
  if (value > -3) return 'Concerning issue that could harm relationship progress'
  return 'Serious problem that may jeopardize the relationship'
}

// Trust impact visualization component (inline)
const TrustImpactVisualization = {
  props: ['impact'],
  template: `
    <div class="flex items-center gap-0.5">
      <div 
        v-for="i in 5" 
        :key="i"
        class="w-2 h-6 rounded-sm transition-colors"
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

// Methods
function validateForm() {
  errors.value = {}
  
  if (!form.value.activity_type) {
    errors.value.activity_type = 'Please select an activity type'
  }
  
  if (!form.value.title?.trim()) {
    errors.value.title = 'Please enter an activity title'
  }
  
  if (!form.value.description?.trim()) {
    errors.value.description = 'Please enter a description'
  }
  
  if (!form.value.activity_date) {
    errors.value.activity_date = 'Please select an activity date'
  } else {
    const selectedDate = new Date(form.value.activity_date)
    const today = new Date()
    if (selectedDate > today) {
      errors.value.activity_date = 'Activity date cannot be in the future'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    // Clean up follow-up fields if not required
    const activityData = { ...form.value }
    if (!activityData.follow_up_required) {
      activityData.follow_up_date = null
      activityData.follow_up_notes = ''
    }
    
    if (isEditing.value) {
      await progressionStore.updateTrustActivity(activityId.value!, activityData)
    } else {
      await progressionStore.createTrustActivity(activityData)
    }
    
    router.push({
      name: 'relationship-progression-details',
      params: { id: progressionId.value }
    })
  } catch (error) {
    console.error('Failed to save activity:', error)
    // TODO: Show error toast
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!activityId.value) return
  
  const confirmed = confirm('Are you sure you want to delete this activity? This action cannot be undone.')
  if (!confirmed) return
  
  try {
    await progressionStore.deleteTrustActivity(activityId.value)
    router.push({
      name: 'relationship-progression-details',
      params: { id: progressionId.value }
    })
  } catch (error) {
    console.error('Failed to delete activity:', error)
    // TODO: Show error toast
  }
}

// Load existing activity data if editing
onMounted(async () => {
  if (!progression.value) {
    await progressionStore.fetchProgressions()
    await organizationStore.fetchOrganizations()
  }
  
  if (isEditing.value) {
    await progressionStore.fetchTrustActivities()
    const activity = progressionStore.getTrustActivitiesForProgression(progressionId.value)
      .find(a => a.id === activityId.value)
    
    if (activity) {
      form.value = {
        relationship_progression_id: activity.relationship_progression_id,
        activity_type: activity.activity_type,
        title: activity.title,
        description: activity.description,
        activity_date: activity.activity_date.split('T')[0],
        impact_on_trust: activity.impact_on_trust,
        outcome_description: activity.outcome_description || '',
        follow_up_required: activity.follow_up_required,
        follow_up_date: activity.follow_up_date?.split('T')[0] || null,
        follow_up_notes: activity.follow_up_notes || '',
        contact_id: activity.contact_id || null,
        interaction_id: activity.interaction_id || null,
        opportunity_id: activity.opportunity_id || null
      }
    }
  }
})
</script>