<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Organization Metrics
      </h3>
      <p class="text-sm text-gray-600">
        Key performance indicators and insights
      </p>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-pulse space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="space-y-2">
            <div class="h-6 bg-gray-300 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div class="h-64 bg-gray-300 rounded"></div>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600 mb-4">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm">{{ error }}</p>
      </div>
      <button 
        @click="$emit('refresh')"
        class="btn btn-secondary"
      >
        Try Again
      </button>
    </div>
    
    <!-- Metrics Content -->
    <div v-else class="space-y-6">
      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Total Organizations -->
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900 mb-1">
            {{ formatNumber(metrics?.total_organizations || 0) }}
          </div>
          <div class="text-sm text-gray-600">Total Organizations</div>
          <div v-if="metrics?.growth_rate" class="text-xs mt-1" :class="getGrowthColor(metrics.growth_rate)">
            {{ formatPercentage(metrics.growth_rate) }} growth
          </div>
        </div>
        
        <!-- With Opportunities -->
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-900 mb-1">
            {{ formatNumber(metrics?.with_opportunities || 0) }}
          </div>
          <div class="text-sm text-blue-700">With Opportunities</div>
          <div v-if="metrics?.total_organizations" class="text-xs text-blue-600 mt-1">
            {{ formatPercentage((metrics.with_opportunities || 0) / metrics.total_organizations * 100) }} of total
          </div>
        </div>
        
        <!-- Total Opportunity Value -->
        <div class="text-center p-4 bg-emerald-50 rounded-lg">
          <div class="text-2xl font-bold text-emerald-900 mb-1">
            {{ formatCurrency(metrics?.total_opportunity_value || 0) }}
          </div>
          <div class="text-sm text-emerald-700">Total Pipeline</div>
          <div v-if="metrics?.average_deal_size" class="text-xs text-emerald-600 mt-1">
            {{ formatCurrency(metrics.average_deal_size) }} avg deal
          </div>
        </div>
        
        <!-- Conversion Rate -->
        <div class="text-center p-4 bg-amber-50 rounded-lg">
          <div class="text-2xl font-bold text-amber-900 mb-1">
            {{ formatPercentage(metrics?.conversion_rate || 0) }}
          </div>
          <div class="text-sm text-amber-700">Conversion Rate</div>
          <div class="text-xs text-amber-600 mt-1">
            Prospects to customers
          </div>
        </div>
      </div>
      
      <!-- Organization Types Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Types Chart -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900">Organizations by Type</h4>
          <div class="space-y-3">
            <div 
              v-for="(count, type) in metrics?.by_type" 
              :key="type"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div 
                  :class="getTypeColor(type)"
                  class="w-3 h-3 rounded-full"
                ></div>
                <span class="text-sm capitalize text-gray-700">{{ type }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-900">{{ count }}</span>
                <span v-if="metrics?.total_organizations" class="text-xs text-gray-500">
                  ({{ formatPercentage(count / metrics.total_organizations * 100) }})
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="space-y-4">
          <h4 class="text-md font-medium text-gray-900">Recent Activity</h4>
          <div class="space-y-3">
            <!-- Organizations Created Recently -->
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span class="text-sm text-gray-700">New Organizations</span>
              </div>
              <span class="text-sm font-medium text-gray-900">
                {{ metrics?.recent_additions || 0 }}
              </span>
            </div>
            
            <!-- Active Organizations -->
            <div class="flex items-center justify-between py-2 border-b border-gray-100">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">Active Organizations</span>
              </div>
              <span class="text-sm font-medium text-gray-900">
                {{ calculateActiveOrganizations() }}
              </span>
            </div>
            
            <!-- Organizations with Products -->
            <div class="flex items-center justify-between py-2">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-violet-500 rounded-full"></div>
                <span class="text-sm text-gray-700">With Products</span>
              </div>
              <span class="text-sm font-medium text-gray-900">
                {{ calculateOrgsWithProducts() }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Performance Indicators -->
      <div class="pt-6 border-t border-gray-200">
        <h4 class="text-md font-medium text-gray-900 mb-4">Performance Indicators</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Pipeline Health -->
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-lg font-semibold text-blue-900 mb-1">
              {{ getPipelineHealthScore() }}%
            </div>
            <div class="text-sm text-blue-700">Pipeline Health</div>
            <div class="text-xs text-blue-600 mt-1">
              Based on opportunity distribution
            </div>
          </div>
          
          <!-- Engagement Rate -->
          <div class="text-center p-4 bg-emerald-50 rounded-lg">
            <div class="text-lg font-semibold text-emerald-900 mb-1">
              {{ getEngagementRate() }}%
            </div>
            <div class="text-sm text-emerald-700">Engagement Rate</div>
            <div class="text-xs text-emerald-600 mt-1">
              Organizations with recent activity
            </div>
          </div>
          
          <!-- Data Completeness -->
          <div class="text-center p-4 bg-amber-50 rounded-lg">
            <div class="text-lg font-semibold text-amber-900 mb-1">
              {{ getDataCompleteness() }}%
            </div>
            <div class="text-sm text-amber-700">Data Completeness</div>
            <div class="text-xs text-amber-600 mt-1">
              Organizations with complete profiles
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrganizationMetrics } from '@/types'

interface Props {
  metrics?: OrganizationMetrics | null
  isLoading?: boolean
  error?: string | null
}

interface Emits {
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  metrics: null,
  isLoading: false,
  error: null
})

defineEmits<Emits>()

// Computed properties for calculated metrics
const calculateActiveOrganizations = () => {
  if (!props.metrics?.by_type) return 0
  
  // Exclude prospects from active count
  const activeTypes = ['customer', 'principal', 'distributor', 'vendor']
  return Object.entries(props.metrics.by_type)
    .filter(([type]) => activeTypes.includes(type))
    .reduce((sum, [, count]) => sum + count, 0)
}

const calculateOrgsWithProducts = () => {
  // This would come from the metrics object in a real implementation
  // For now, estimate based on principals (who typically have products)
  return props.metrics?.by_type?.principal || 0
}

const getPipelineHealthScore = () => {
  if (!props.metrics) return 0
  
  const { total_organizations = 0, with_opportunities = 0, conversion_rate = 0 } = props.metrics
  
  if (total_organizations === 0) return 0
  
  // Calculate score based on opportunity coverage and conversion rate
  const opportunityCoverage = (with_opportunities / total_organizations) * 100
  const weightedScore = (opportunityCoverage * 0.6) + (conversion_rate * 0.4)
  
  return Math.round(weightedScore)
}

const getEngagementRate = () => {
  if (!props.metrics) return 0
  
  const { total_organizations = 0, recent_additions = 0 } = props.metrics
  
  if (total_organizations === 0) return 0
  
  // Simple engagement based on recent activity
  // In a real implementation, this would consider various activity types
  const engagementScore = Math.min((recent_additions / total_organizations) * 100 * 5, 100)
  
  return Math.round(engagementScore)
}

const getDataCompleteness = () => {
  // This would be calculated based on required fields completion
  // For now, return a reasonable estimate
  return 75
}

// Utility functions
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toString()
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toLocaleString()}`
}

const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`
}

const getGrowthColor = (rate: number): string => {
  if (rate > 0) return 'text-emerald-600'
  if (rate < 0) return 'text-red-600'
  return 'text-gray-600'
}

const getTypeColor = (type: string): string => {
  const colorMap = {
    customer: 'bg-emerald-500',
    principal: 'bg-blue-500',
    distributor: 'bg-violet-500',
    prospect: 'bg-amber-500',
    vendor: 'bg-gray-500'
  }
  return colorMap[type as keyof typeof colorMap] || 'bg-gray-500'
}
</script>