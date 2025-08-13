<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Organization Hierarchy</h3>
          <p class="text-sm text-gray-600 mt-1">
            View relationships and organizational structure
          </p>
        </div>
        
        <!-- View Controls -->
        <div class="flex items-center space-x-3">
          <!-- View Mode Toggle -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'tree'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'tree'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Tree View
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              List View
            </button>
          </div>
          
          <!-- Expand/Collapse All -->
          <button
            v-if="viewMode === 'tree' && hierarchyData.length > 0"
            @click="toggleExpandAll"
            class="btn btn-secondary text-sm"
          >
            {{ allExpanded ? 'Collapse All' : 'Expand All' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-pulse space-y-4">
        <div class="h-6 bg-gray-300 rounded w-1/3 mx-auto"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <p class="text-gray-500 mt-4">Loading hierarchy...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 mb-4">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-lg font-medium">Error loading hierarchy</p>
        <p class="text-sm">{{ error }}</p>
      </div>
      <button @click="loadHierarchy" class="btn btn-primary">
        Try Again
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="hierarchyData.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hierarchy data</h3>
      <p class="text-gray-600">
        No parent-child relationships found for organizations
      </p>
    </div>
    
    <!-- Tree View -->
    <div v-else-if="viewMode === 'tree'" class="space-y-4">
      <div class="overflow-x-auto">
        <div class="min-w-full">
          <HierarchyNode
            v-for="node in hierarchyData"
            :key="node.organization.id"
            :node="node"
            :level="0"
            :expanded-nodes="expandedNodes"
            @toggle="toggleNode"
            @view="handleViewOrganization"
            @edit="handleEditOrganization"
            @add-child="handleAddChild"
          />
        </div>
      </div>
    </div>
    
    <!-- List View -->
    <div v-else class="space-y-2">
      <div 
        v-for="org in flatHierarchy"
        :key="org.id"
        class="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
        :style="{ marginLeft: `${org.level * 24}px` }"
        @click="handleViewOrganization(org.id)"
      >
        <div class="flex items-center space-x-3 flex-1">
          <OrganizationAvatar :organization="org" size="sm" />
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-medium text-gray-900">{{ org.name }}</span>
              <OrganizationTypeChip :type="org.type" size="sm" />
            </div>
            <div class="text-sm text-gray-500">
              {{ org.industry || 'No industry specified' }}
            </div>
          </div>
        </div>
        
        <!-- Level Indicator -->
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-500">Level {{ org.level }}</span>
          <div class="flex items-center space-x-1">
            <button
              @click.stop="handleEditOrganization(org.id)"
              class="p-1 text-gray-400 hover:text-gray-600"
              title="Edit organization"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hierarchy Statistics -->
    <div v-if="hierarchyData.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Hierarchy Statistics</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-lg font-semibold text-gray-900">{{ rootOrganizations }}</div>
          <div class="text-xs text-gray-500">Root Organizations</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-lg font-semibold text-gray-900">{{ totalOrganizations }}</div>
          <div class="text-xs text-gray-500">Total Organizations</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-lg font-semibold text-gray-900">{{ maxDepth }}</div>
          <div class="text-xs text-gray-500">Maximum Depth</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-lg font-semibold text-gray-900">{{ averageChildren }}</div>
          <div class="text-xs text-gray-500">Avg Children</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organizationStore'
import OrganizationAvatar from '../atomic/OrganizationAvatar.vue'
import OrganizationTypeChip from '../atomic/OrganizationTypeChip.vue'
import HierarchyNode from './HierarchyNode.vue'
import type { OrganizationTree } from '@/types'
import type { Organization } from '@/types'

interface Props {
  rootOrganizationId?: string
  maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxDepth: 5
})

const router = useRouter()
const organizationStore = useOrganizationStore()

// Component state
const viewMode = ref<'tree' | 'list'>('tree')
const isLoading = ref(true)
const error = ref<string | null>(null)
const hierarchyData = ref<OrganizationTree[]>([])
const expandedNodes = ref<Set<string>>(new Set())

// Computed properties
const allExpanded = computed(() => {
  const allNodeIds = getAllNodeIds(hierarchyData.value)
  return allNodeIds.length > 0 && allNodeIds.every(id => expandedNodes.value.has(id))
})

const flatHierarchy = computed(() => {
  const flatten = (nodes: OrganizationTree[], level = 0): (Organization & { level: number })[] => {
    let result: (Organization & { level: number })[] = []
    
    for (const node of nodes) {
      result.push({ ...node.organization, level })
      if (node.children.length > 0) {
        result.push(...flatten(node.children, level + 1))
      }
    }
    
    return result
  }
  
  return flatten(hierarchyData.value)
})

const rootOrganizations = computed(() => hierarchyData.value.length)
const totalOrganizations = computed(() => flatHierarchy.value.length)
const maxDepth = computed(() => {
  if (flatHierarchy.value.length === 0) return 0
  return Math.max(...flatHierarchy.value.map(org => org.level)) + 1
})
const averageChildren = computed(() => {
  if (hierarchyData.value.length === 0) return 0
  const totalNodes = flatHierarchy.value.length
  const nodesWithChildren = flatHierarchy.value.filter(org => {
    const node = findNodeById(hierarchyData.value, org.id)
    return node?.children && node.children.length > 0
  }).length
  
  return nodesWithChildren > 0 ? Math.round((totalNodes - rootOrganizations.value) / nodesWithChildren * 10) / 10 : 0
})

// Methods
const loadHierarchy = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Load organizations first
    await organizationStore.fetchOrganizations()
    
    if (props.rootOrganizationId) {
      // Load specific organization hierarchy
      const organization = organizationStore.getOrganizationById(props.rootOrganizationId)
      if (organization) {
        hierarchyData.value = [await buildOrganizationTree(organization, 0)]
      }
    } else {
      // Load all root organizations and their hierarchies
      const rootOrgs = organizationStore.rootOrganizations
      hierarchyData.value = await Promise.all(
        rootOrgs.map(async org => {
          return await buildOrganizationTree(org, 0)
        })
      )
    }
    
    // Auto-expand first level by default
    hierarchyData.value.forEach(node => {
      expandedNodes.value.add(node.organization.id)
    })
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load hierarchy'
  } finally {
    isLoading.value = false
  }
}

const buildOrganizationTree = async (
  organization: Organization, 
  level: number
): Promise<OrganizationTree> => {
  const children = organizationStore.getChildOrganizations(organization.id)
  
  const childTrees = await Promise.all(
    children.map((child: Organization) => buildOrganizationTree(child, level + 1))
  )
  
  return {
    organization,
    children: childTrees,
    level,
    has_children: children.length > 0
  }
}

const toggleNode = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const toggleExpandAll = () => {
  if (allExpanded.value) {
    // Collapse all except root nodes
    expandedNodes.value.clear()
    hierarchyData.value.forEach(node => {
      expandedNodes.value.add(node.organization.id)
    })
  } else {
    // Expand all nodes
    const allNodeIds = getAllNodeIds(hierarchyData.value)
    allNodeIds.forEach(id => expandedNodes.value.add(id))
  }
}

const getAllNodeIds = (nodes: OrganizationTree[]): string[] => {
  let ids: string[] = []
  
  for (const node of nodes) {
    ids.push(node.organization.id)
    if (node.children.length > 0) {
      ids.push(...getAllNodeIds(node.children))
    }
  }
  
  return ids
}

const findNodeById = (nodes: OrganizationTree[], id: string): OrganizationTree | null => {
  for (const node of nodes) {
    if (node.organization.id === id) {
      return node
    }
    
    if (node.children.length > 0) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  
  return null
}

// Event handlers
const handleViewOrganization = (id: string) => {
  router.push(`/organizations/${id}`)
}

const handleEditOrganization = (id: string) => {
  router.push(`/organizations/${id}/edit`)
}

const handleAddChild = (parentId: string) => {
  router.push({
    path: '/organizations/new',
    query: { parent: parentId }
  })
}

// Lifecycle
onMounted(() => {
  loadHierarchy()
})
</script>

<style scoped>
/* Add any component-specific styles */
</style>