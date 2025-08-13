<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Form Progress (Multi-step) -->
    <div v-if="isMultiStep" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex space-x-2">
          <div 
            v-for="(step, index) in formSteps"
            :key="step.id"
            class="flex items-center"
          >
            <div 
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                index < currentStep 
                  ? 'bg-primary-600 text-white' 
                  : index === currentStep 
                    ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                    : 'bg-gray-200 text-gray-500'
              ]"
            >
              {{ index + 1 }}
            </div>
            <div 
              v-if="index < formSteps.length - 1"
              :class="[
                'w-12 h-0.5 mx-2',
                index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
              ]"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Current Step Info -->
      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ formSteps[currentStep].title }}
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          {{ formSteps[currentStep].description }}
        </p>
      </div>
    </div>
    
    <!-- Form Fields -->
    <div class="space-y-6">
      <!-- Step 1: Basic Information -->
      <div v-if="!isMultiStep || currentStep === 0" class="space-y-4">
        <!-- Organization Name -->
        <div>
          <label for="name" class="form-label required">
            Organization Name
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.name }"
            placeholder="Enter organization name"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">
            {{ errors.name }}
          </p>
        </div>
        
        <!-- Organization Type -->
        <div>
          <label for="type" class="form-label required">
            Organization Type
          </label>
          <select
            id="type"
            v-model="formData.type"
            required
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.type }"
          >
            <option value="">Select type</option>
            <option 
              v-for="type in organizationTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>
          <p v-if="errors.type" class="mt-1 text-sm text-red-600">
            {{ errors.type }}
          </p>
        </div>
        
        <!-- Description -->
        <div>
          <label for="description" class="form-label">
            Description
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            :disabled="isSubmitting"
            rows="3"
            class="form-input resize-none"
            :class="{ 'border-red-300': errors.description }"
            placeholder="Brief description of the organization"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">
            {{ errors.description }}
          </p>
        </div>
        
        <!-- Industry (required for principals) -->
        <div>
          <label for="industry" class="form-label" :class="{ required: formData.type === 'principal' }">
            Industry
          </label>
          <select
            id="industry"
            v-model="formData.industry"
            :required="formData.type === 'principal'"
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.industry }"
          >
            <option value="">Select industry</option>
            <option 
              v-for="industry in industries"
              :key="industry"
              :value="industry"
            >
              {{ industry }}
            </option>
          </select>
          <p v-if="errors.industry" class="mt-1 text-sm text-red-600">
            {{ errors.industry }}
          </p>
        </div>
      </div>
      
      <!-- Step 2: Contact Information -->
      <div v-if="!isMultiStep || currentStep === 1" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Email -->
          <div>
            <label for="email" class="form-label">
              Email Address
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              :disabled="isSubmitting"
              class="form-input"
              :class="{ 'border-red-300': errors.email }"
              placeholder="contact@company.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>
          
          <!-- Phone -->
          <div>
            <label for="phone" class="form-label">
              Phone Number
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              :disabled="isSubmitting"
              class="form-input"
              :class="{ 'border-red-300': errors.phone }"
              placeholder="+1 (555) 123-4567"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">
              {{ errors.phone }}
            </p>
          </div>
        </div>
        
        <!-- Website -->
        <div>
          <label for="website" class="form-label">
            Website
          </label>
          <input
            id="website"
            v-model="formData.website"
            type="url"
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.website }"
            placeholder="https://www.company.com"
          />
          <p v-if="errors.website" class="mt-1 text-sm text-red-600">
            {{ errors.website }}
          </p>
        </div>
      </div>
      
      <!-- Step 3: Address Information -->
      <div v-if="!isMultiStep || currentStep === 2" class="space-y-4">
        <!-- Street Address -->
        <div>
          <label for="address_line_1" class="form-label">
            Street Address
          </label>
          <input
            id="address_line_1"
            v-model="formData.address_line_1"
            type="text"
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.address_line_1 }"
            placeholder="123 Main Street"
          />
          <p v-if="errors.address_line_1" class="mt-1 text-sm text-red-600">
            {{ errors.address_line_1 }}
          </p>
        </div>
        
        <!-- Address Line 2 -->
        <div>
          <label for="address_line_2" class="form-label">
            Address Line 2
          </label>
          <input
            id="address_line_2"
            v-model="formData.address_line_2"
            type="text"
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.address_line_2 }"
            placeholder="Suite 100 (optional)"
          />
          <p v-if="errors.address_line_2" class="mt-1 text-sm text-red-600">
            {{ errors.address_line_2 }}
          </p>
        </div>
        
        <!-- City, State, Postal Code -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="city" class="form-label">
              City
            </label>
            <input
              id="city"
              v-model="formData.city"
              type="text"
              :disabled="isSubmitting"
              class="form-input"
              :class="{ 'border-red-300': errors.city }"
              placeholder="New York"
            />
            <p v-if="errors.city" class="mt-1 text-sm text-red-600">
              {{ errors.city }}
            </p>
          </div>
          
          <div>
            <label for="state_province" class="form-label">
              State/Province
            </label>
            <input
              id="state_province"
              v-model="formData.state_province"
              type="text"
              :disabled="isSubmitting"
              class="form-input"
              :class="{ 'border-red-300': errors.state_province }"
              placeholder="NY"
            />
            <p v-if="errors.state_province" class="mt-1 text-sm text-red-600">
              {{ errors.state_province }}
            </p>
          </div>
          
          <div>
            <label for="postal_code" class="form-label">
              Postal Code
            </label>
            <input
              id="postal_code"
              v-model="formData.postal_code"
              type="text"
              :disabled="isSubmitting"
              class="form-input"
              :class="{ 'border-red-300': errors.postal_code }"
              placeholder="10001"
            />
            <p v-if="errors.postal_code" class="mt-1 text-sm text-red-600">
              {{ errors.postal_code }}
            </p>
          </div>
        </div>
        
        <!-- Country -->
        <div>
          <label for="country" class="form-label">
            Country
          </label>
          <select
            id="country"
            v-model="formData.country"
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.country }"
          >
            <option value="">Select country</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Other">Other</option>
          </select>
          <p v-if="errors.country" class="mt-1 text-sm text-red-600">
            {{ errors.country }}
          </p>
        </div>
      </div>
      
      <!-- Step 4: Business Details -->
      <div v-if="!isMultiStep || currentStep === 3" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Annual Revenue -->
          <div>
            <label for="annual_revenue" class="form-label">
              Annual Revenue ($)
            </label>
            <input
              id="annual_revenue"
              v-model.number="formData.annual_revenue"
              type="number"
              min="0"
              step="1000"
              :disabled="isSubmitting"
              class="form-input"
              :class="{ 'border-red-300': errors.annual_revenue }"
              placeholder="1000000"
            />
            <p v-if="errors.annual_revenue" class="mt-1 text-sm text-red-600">
              {{ errors.annual_revenue }}
            </p>
          </div>
          
          <!-- Employee Count -->
          <div>
            <label for="employee_count" class="form-label">
              Number of Employees
            </label>
            <input
              id="employee_count"
              v-model.number="formData.employee_count"
              type="number"
              min="1"
              :disabled="isSubmitting"
              class="form-input"
              :class="{ 'border-red-300': errors.employee_count }"
              placeholder="50"
            />
            <p v-if="errors.employee_count" class="mt-1 text-sm text-red-600">
              {{ errors.employee_count }}
            </p>
          </div>
        </div>
        
        <!-- Parent Organization -->
        <div>
          <label for="parent_organization_id" class="form-label">
            Parent Organization
          </label>
          <select
            id="parent_organization_id"
            v-model="formData.parent_organization_id"
            :disabled="isSubmitting"
            class="form-input"
            :class="{ 'border-red-300': errors.parent_organization_id }"
          >
            <option value="">No parent organization</option>
            <option 
              v-for="org in availableParentOrganizations"
              :key="org.id"
              :value="org.id"
            >
              {{ org.name }} ({{ org.type }})
            </option>
          </select>
          <p v-if="errors.parent_organization_id" class="mt-1 text-sm text-red-600">
            {{ errors.parent_organization_id }}
          </p>
        </div>
      </div>
    </div>
    
    <!-- Form Actions -->
    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
      <div class="flex space-x-3">
        <!-- Previous Button (Multi-step) -->
        <button
          v-if="isMultiStep && currentStep > 0"
          type="button"
          @click="previousStep"
          :disabled="isSubmitting"
          class="btn btn-secondary"
        >
          Previous
        </button>
        
        <!-- Cancel Button -->
        <button
          type="button"
          @click="handleCancel"
          :disabled="isSubmitting"
          class="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
      
      <div class="flex space-x-3">
        <!-- Next Button (Multi-step) -->
        <button
          v-if="isMultiStep && currentStep < formSteps.length - 1"
          type="button"
          @click="nextStep"
          :disabled="isSubmitting || !isCurrentStepValid"
          class="btn btn-primary"
        >
          Next
        </button>
        
        <!-- Submit Button -->
        <button
          v-if="!isMultiStep || currentStep === formSteps.length - 1"
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          class="btn btn-primary"
        >
          <span v-if="isSubmitting" class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m15.84 13.5-.69-.71-.71.71.71.71.69-.71zM12 3a9 9 0 000 18 9 9 0 000-18z"></path>
            </svg>
            {{ isEditMode ? 'Updating...' : 'Creating...' }}
          </span>
          <span v-else>
            {{ isEditMode ? 'Update Organization' : 'Create Organization' }}
          </span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { 
  CreateOrganizationSchema, 
  UpdateOrganizationSchema, 
  OrganizationType 
} from '@/types'

interface Props {
  initialData?: Partial<CreateOrganizationSchema>
  isEditMode?: boolean
  isMultiStep?: boolean
  availableParentOrganizations?: Array<{ id: string; name: string; type: OrganizationType }>
  isSubmitting?: boolean
}

interface Emits {
  (e: 'submit', data: CreateOrganizationSchema | UpdateOrganizationSchema): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  isMultiStep: false,
  availableParentOrganizations: () => [],
  isSubmitting: false
})

const emit = defineEmits<Emits>()

// Form state
const currentStep = ref(0)
const formData = ref<CreateOrganizationSchema>({
  name: '',
  type: '' as OrganizationType,
  description: '',
  phone: '',
  email: '',
  website: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state_province: '',
  postal_code: '',
  country: 'United States',
  annual_revenue: undefined,
  employee_count: undefined,
  industry: '',
  parent_organization_id: ''
})

const errors = ref<Record<string, string>>({})

// Configuration
const organizationTypes = [
  { value: 'customer' as OrganizationType, label: 'Customer' },
  { value: 'principal' as OrganizationType, label: 'Principal' },
  { value: 'distributor' as OrganizationType, label: 'Distributor' },
  { value: 'prospect' as OrganizationType, label: 'Prospect' },
  { value: 'vendor' as OrganizationType, label: 'Vendor' }
]

const industries = [
  'Food Service',
  'Restaurants',
  'Hospitality',
  'Retail Food',
  'Catering',
  'Healthcare Food Service',
  'Education Food Service',
  'Corporate Dining',
  'Food Manufacturing',
  'Food Distribution'
]

const formSteps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Enter the organization name, type, and description',
    fields: ['name', 'type', 'description', 'industry']
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Add contact details for the organization',
    fields: ['email', 'phone', 'website']
  },
  {
    id: 'address',
    title: 'Address Information',
    description: 'Enter the organization\'s physical address',
    fields: ['address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code', 'country']
  },
  {
    id: 'business',
    title: 'Business Details',
    description: 'Add business metrics and relationships',
    fields: ['annual_revenue', 'employee_count', 'parent_organization_id']
  }
]

// Computed properties
const isFormValid = computed(() => {
  // Required fields validation
  if (!formData.value.name.trim()) return false
  if (!formData.value.type) return false
  
  // Principal-specific validation
  if (formData.value.type === 'principal' && !formData.value.industry) {
    return false
  }
  
  // Email format validation
  if (formData.value.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.value.email)) {
      return false
    }
  }
  
  // Website format validation
  if (formData.value.website) {
    const urlRegex = /^https?:\/\/.+/
    if (!urlRegex.test(formData.value.website)) {
      return false
    }
  }
  
  return Object.keys(errors.value).length === 0
})

const isCurrentStepValid = computed(() => {
  if (!props.isMultiStep) return isFormValid.value
  
  const currentStepFields = formSteps[currentStep.value].fields
  
  // Check required fields for current step
  for (const field of currentStepFields) {
    if (field === 'name' && !formData.value.name.trim()) return false
    if (field === 'type' && !formData.value.type) return false
    if (field === 'industry' && formData.value.type === 'principal' && !formData.value.industry) return false
  }
  
  // Check for errors in current step fields
  for (const field of currentStepFields) {
    if (errors.value[field]) return false
  }
  
  return true
})

// Methods
const validateField = (field: keyof CreateOrganizationSchema, value: any) => {
  delete errors.value[field]
  
  switch (field) {
    case 'name':
      if (!value || !value.trim()) {
        errors.value.name = 'Organization name is required'
      } else if (value.length < 2) {
        errors.value.name = 'Organization name must be at least 2 characters'
      }
      break
      
    case 'type':
      if (!value) {
        errors.value.type = 'Organization type is required'
      }
      break
      
    case 'industry':
      if (formData.value.type === 'principal' && !value) {
        errors.value.industry = 'Industry is required for principal organizations'
      }
      break
      
    case 'email':
      if (value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors.value.email = 'Please enter a valid email address'
        }
      }
      break
      
    case 'website':
      if (value) {
        const urlRegex = /^https?:\/\/.+/
        if (!urlRegex.test(value)) {
          errors.value.website = 'Website must start with http:// or https://'
        }
      }
      break
      
    case 'annual_revenue':
      if (value !== undefined && value < 0) {
        errors.value.annual_revenue = 'Annual revenue cannot be negative'
      }
      break
      
    case 'employee_count':
      if (value !== undefined && value < 1) {
        errors.value.employee_count = 'Employee count must be at least 1'
      }
      break
  }
}

const validateAllFields = () => {
  Object.keys(formData.value).forEach(field => {
    validateField(field as keyof CreateOrganizationSchema, formData.value[field as keyof CreateOrganizationSchema])
  })
}

const nextStep = () => {
  if (currentStep.value < formSteps.length - 1 && isCurrentStepValid.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSubmit = () => {
  validateAllFields()
  
  if (isFormValid.value) {
    // Clean up the data
    const submitData = { ...formData.value }
    
    // Convert empty strings to undefined for optional fields
    Object.keys(submitData).forEach(key => {
      const typedKey = key as keyof CreateOrganizationSchema
      if (submitData[typedKey] === '') {
        // Use type assertion to handle the assignment
        ;(submitData as any)[typedKey] = undefined
      }
    })
    
    emit('submit', submitData)
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Initialize form with initial data
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      Object.assign(formData.value, newData)
    }
  },
  { immediate: true }
)

// Watch for field changes and validate
watch(
  () => formData.value,
  (newData, oldData) => {
    if (oldData) {
      Object.keys(newData).forEach(field => {
        if (newData[field as keyof CreateOrganizationSchema] !== oldData[field as keyof CreateOrganizationSchema]) {
          validateField(field as keyof CreateOrganizationSchema, newData[field as keyof CreateOrganizationSchema])
        }
      })
    }
  },
  { deep: true }
)
</script>

<style scoped>
.required::after {
  content: ' *';
  color: #ef4444;
}
</style>