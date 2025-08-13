<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Header -->
        <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Organization Hierarchy</h1>
            <p class="mt-1 text-sm text-gray-600">
              Visualize organizational relationships and structure
            </p>
          </div>
          
          <!-- Header Actions -->
          <div class="mt-4 sm:mt-0 flex items-center space-x-3">
            <router-link to="/organizations" class="btn btn-secondary">
              ← Back to Organizations
            </router-link>
            <router-link to="/organizations/new" class="btn btn-primary">
              Add Organization
            </router-link>
          </div>
        </div>
        
        <!-- Hierarchy Component -->
        <OrganizationHierarchyComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OrganizationHierarchyComponent from '@/components/organizations/organism/OrganizationHierarchy.vue'
</script>