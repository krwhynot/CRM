<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ isSignUp ? 'Create your account' : 'Sign in to your account' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          KitchenPantry CRM - Sales Manager Portal
        </p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': emailError }"
              placeholder="Enter your email"
              @blur="validateEmail"
              @input="clearEmailError"
            />
            <p v-if="emailError" class="mt-1 text-sm text-red-600">
              {{ emailError }}
            </p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': passwordError }"
              placeholder="Enter your password"
              @blur="validatePassword"
              @input="clearPasswordError"
            />
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">
              {{ passwordError }}
            </p>
          </div>
        </div>

        <!-- Global Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Sign in failed
              </h3>
              <p class="mt-1 text-sm text-red-700">
                {{ error }}
              </p>
            </div>
            <button
              @click="clearError"
              class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 inline-flex h-8 w-8"
            >
              <span class="sr-only">Close</span>
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create account' : 'Sign in') }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Need an account? 
            <button 
              type="button"
              @click="toggleMode"
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              {{ isSignUp ? 'Sign in here' : 'Sign up here' }}
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Form state
const form = ref({
  email: '',
  password: ''
})

// UI state
const isSignUp = ref(false)

// Field-level validation errors
const emailError = ref('')
const passwordError = ref('')

// Use auth composable
const { signIn, signUp, loading, error, clearError, redirectIfAuthenticated } = useAuth()

// Form validation
const validateEmail = () => {
  if (!form.value.email) {
    emailError.value = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  emailError.value = ''
  return true
}

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = 'Password is required'
    return false
  }
  if (form.value.password.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  passwordError.value = ''
  return true
}

const clearEmailError = () => {
  if (emailError.value) emailError.value = ''
}

const clearPasswordError = () => {
  if (passwordError.value) passwordError.value = ''
}

const isFormValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         !emailError.value && 
         !passwordError.value
})

// Toggle between sign in and sign up
const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  clearError()
  emailError.value = ''
  passwordError.value = ''
}

// Form submission
const handleSubmit = async () => {
  // Clear any existing errors
  clearError()
  
  // Validate all fields
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  
  if (!isEmailValid || !isPasswordValid) {
    return
  }

  // Attempt sign in or sign up
  if (isSignUp.value) {
    await signUp(form.value.email, form.value.password)
  } else {
    await signIn(form.value.email, form.value.password)
  }
}

// Redirect if already authenticated
onMounted(() => {
  redirectIfAuthenticated()
})
</script>