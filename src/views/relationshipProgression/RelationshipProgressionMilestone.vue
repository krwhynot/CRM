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
            {{ isEditing ? 'Edit Milestone' : 'Add Milestone' }}
          </span>
        </nav>
        
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditing ? 'Edit Milestone' : 'Add Milestone' }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ isEditing ? 'Update milestone details' : 'Record a new relationship milestone' }} for {{ organizationName }}
          </p>
        </div>
      </div>
      
      <!-- Form -->
      <div class="bg-white rounded-lg border shadow-sm">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Milestone Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Milestone Type <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="form.milestone"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.milestone ? 'border-red-300' : 'border-gray-300'
              ]"
              required
            >
              <option value="">Select a milestone type</option>
              <option 
                v-for="milestone in PROGRESSION_MILESTONES" 
                :key="milestone.value"
                :value="milestone.value"
              >
                {{ milestone.label }} - {{ milestone.description }}
              </option>
            </select>
            <p v-if="errors.milestone" class="mt-1 text-sm text-red-600">{{ errors.milestone }}</p>
          </div>
          
          <!-- Achievement Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Achievement Date <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.achieved_date"
              type="date"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.achieved_date ? 'border-red-300' : 'border-gray-300'
              ]"
              required
            />
            <p v-if="errors.achieved_date" class="mt-1 text-sm text-red-600">{{ errors.achieved_date }}</p>
          </div>
          
          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.milestone_description"
              rows="3"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.milestone_description ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="Describe what was achieved and the context around this milestone..."
            />
            <p v-if="errors.milestone_description" class="mt-1 text-sm text-red-600">{{ errors.milestone_description }}</p>
          </div>
          
          <!-- Significance Score -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Significance Score
            </label>
            <div class="flex items-center gap-4">
              <input
                v-model.number="form.significance_score"
                type="range"
                min="1"
                max="5"
                step="1"
                class="flex-1"
              />
              <div class="flex items-center gap-1">
                <Star 
                  v-for="i in 5" 
                  :key="i"
                  :class="[
                    'w-4 h-4',
                    i <= form.significance_score ? 'text-amber-500 fill-current' : 'text-gray-300'
                  ]"
                />
                <span class="ml-2 text-sm text-gray-600">{{ form.significance_score }}/5</span>
              </div>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Rate the strategic importance of this milestone (1 = Minor, 5 = Major breakthrough)
            </p>
          </div>
          
          <!-- Impact Assessment -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Impact Assessment
            </label>
            <textarea
              v-model="form.impact_assessment"
              rows="3"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.impact_assessment ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="How does this milestone impact the overall relationship? What doors does it open?"
            />
            <p v-if="errors.impact_assessment" class="mt-1 text-sm text-red-600">{{ errors.impact_assessment }}</p>
          </div>
          
          <!-- Next Steps -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Next Steps
            </label>
            <textarea
              v-model="form.next_steps"
              rows="2"
              :class="[
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.next_steps ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="What should be the next actions to build on this milestone?"
            />
            <p v-if="errors.next_steps" class="mt-1 text-sm text-red-600">{{ errors.next_steps }}</p>
          </div>
          
          <!-- Related Entities (Optional) -->
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
          
          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional context, observations, or follow-up items..."
            />
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
                Delete Milestone
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
                {{ isEditing ? 'Update Milestone' : 'Add Milestone' }}
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
import { PROGRESSION_MILESTONES } from '@/types/relationshipProgression.types'
import type { RelationshipMilestoneInsert } from '@/types/relationshipProgression.types'

// Lucide icons
import { ChevronRight, Star, RefreshCw } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const progressionStore = useRelationshipProgressionStore()
const organizationStore = useOrganizationStore()

// Route params
const progressionId = computed(() => route.params.id as string)
const milestoneId = computed(() => route.params.milestoneId as string | undefined)
const isEditing = computed(() => !!milestoneId.value)

// Form state
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref<RelationshipMilestoneInsert>({
  relationship_progression_id: progressionId.value,
  milestone: '',
  achieved_date: new Date().toISOString().split('T')[0],
  significance_score: 3,
  milestone_description: '',
  impact_assessment: '',
  next_steps: '',
  contact_id: null,
  interaction_id: null,
  opportunity_id: null,
  notes: ''
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

// Methods
function validateForm() {
  errors.value = {}
  
  if (!form.value.milestone) {
    errors.value.milestone = 'Please select a milestone type'
  }
  
  if (!form.value.achieved_date) {
    errors.value.achieved_date = 'Please select an achievement date'
  } else {
    const selectedDate = new Date(form.value.achieved_date)
    const today = new Date()
    if (selectedDate > today) {
      errors.value.achieved_date = 'Achievement date cannot be in the future'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    if (isEditing.value) {
      await progressionStore.updateMilestone(milestoneId.value!, form.value)
    } else {
      await progressionStore.createMilestone(form.value)
    }
    
    router.push({
      name: 'relationship-progression-details',
      params: { id: progressionId.value }
    })
  } catch (error) {
    console.error('Failed to save milestone:', error)
    // TODO: Show error toast
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!milestoneId.value) return
  
  const confirmed = confirm('Are you sure you want to delete this milestone? This action cannot be undone.')
  if (!confirmed) return
  
  try {
    await progressionStore.deleteMilestone(milestoneId.value)
    router.push({
      name: 'relationship-progression-details',
      params: { id: progressionId.value }
    })
  } catch (error) {
    console.error('Failed to delete milestone:', error)
    // TODO: Show error toast
  }
}

// Load existing milestone data if editing
onMounted(async () => {
  if (!progression.value) {
    await progressionStore.fetchProgressions()
    await organizationStore.fetchOrganizations()
  }
  
  if (isEditing.value) {
    await progressionStore.fetchMilestones()
    const milestone = progressionStore.getMilestonesForProgression(progressionId.value)
      .find(m => m.id === milestoneId.value)
    
    if (milestone) {
      form.value = {
        relationship_progression_id: milestone.relationship_progression_id,
        milestone: milestone.milestone,
        achieved_date: milestone.achieved_date.split('T')[0],
        significance_score: milestone.significance_score || 3,
        milestone_description: milestone.milestone_description || '',
        impact_assessment: milestone.impact_assessment || '',
        next_steps: milestone.next_steps || '',
        contact_id: milestone.contact_id || null,
        interaction_id: milestone.interaction_id || null,
        opportunity_id: milestone.opportunity_id || null,
        notes: milestone.notes || ''
      }
    }
  }
})
</script>