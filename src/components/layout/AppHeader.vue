<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Title -->
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-900">
            KitchenPantry CRM
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/dashboard"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.name === 'Dashboard' }"
          >
            Dashboard
          </router-link>
          <router-link
            to="/organizations"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.name === 'organizations-list' }"
          >
            Organizations
          </router-link>
          <router-link
            to="/contacts"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.name === 'contacts-list' }"
          >
            Contacts
          </router-link>
          <router-link
            to="/products"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.name === 'products-list' }"
          >
            Products
          </router-link>
          <router-link
            to="/opportunities"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.name === 'opportunities-list' }"
          >
            Opportunities
          </router-link>
          <router-link
            to="/interactions"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.name === 'interactions-list' }"
          >
            Interactions
          </router-link>
          <router-link
            to="/relationships/progression"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-blue-600 bg-blue-50': $route.name?.toString().includes('relationship-progression') }"
          >
            Relationships
          </router-link>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-700">
            Welcome, {{ userEmail }}
          </div>
          <button
            @click="handleSignOut"
            :disabled="loading"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Signing out...' : 'Sign Out' }}
          </button>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-700 hover:text-blue-600 p-2 rounded-md"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
        <router-link
          to="/dashboard"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white"
          :class="{ 'text-blue-600 bg-white': $route.name === 'Dashboard' }"
          @click="mobileMenuOpen = false"
        >
          Dashboard
        </router-link>
        <router-link
          to="/organizations"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white"
          :class="{ 'text-blue-600 bg-white': $route.name === 'organizations-list' }"
          @click="mobileMenuOpen = false"
        >
          Organizations
        </router-link>
        <router-link
          to="/contacts"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white"
          :class="{ 'text-blue-600 bg-white': $route.name === 'contacts-list' }"
          @click="mobileMenuOpen = false"
        >
          Contacts
        </router-link>
        <router-link
          to="/products"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white"
          :class="{ 'text-blue-600 bg-white': $route.name === 'products-list' }"
          @click="mobileMenuOpen = false"
        >
          Products
        </router-link>
        <router-link
          to="/opportunities"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white"
          :class="{ 'text-blue-600 bg-white': $route.name === 'opportunities-list' }"
          @click="mobileMenuOpen = false"
        >
          Opportunities
        </router-link>
        <router-link
          to="/interactions"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white"
          :class="{ 'text-blue-600 bg-white': $route.name === 'interactions-list' }"
          @click="mobileMenuOpen = false"
        >
          Interactions
        </router-link>
        <router-link
          to="/relationships/progression"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white"
          :class="{ 'text-blue-600 bg-white': $route.name?.toString().includes('relationship-progression') }"
          @click="mobileMenuOpen = false"
        >
          Relationships
        </router-link>
        
        <div class="border-t border-gray-200 pt-3 mt-3">
          <div class="px-3 py-2 text-sm text-gray-600">
            {{ userEmail }}
          </div>
          <button
            @click="handleSignOut"
            :disabled="loading"
            class="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Signing out...' : 'Sign Out' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const mobileMenuOpen = ref(false)

const { userEmail, signOut, loading } = useAuth()

const handleSignOut = async () => {
  mobileMenuOpen.value = false
  await signOut()
}
</script>