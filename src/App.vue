<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Loading screen while auth initializes -->
    <div v-if="authLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Loading KitchenPantry CRM...</p>
      </div>
    </div>

    <!-- Main app content -->
    <div v-else>
      <!-- Header for authenticated users (not shown on login page) -->
      <AppHeader v-if="isAuthenticated && $route.name !== 'Login'" />
      
      <!-- Main content -->
      <main :class="{ 'pt-0': !isAuthenticated || $route.name === 'Login' }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/authStore'

const { isAuthenticated, loading: authLoading } = useAuth()
const authStore = useAuthStore()

// Initialize authentication on app start
onMounted(async () => {
  await authStore.initializeAuth()
})
</script>