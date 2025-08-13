<template>
  <div class="select-none">
    <!-- Node Content -->
    <div 
      class="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer group"
      :style="{ marginLeft: `${level * 24}px` }"
      @click="handleToggle"
    >
      <!-- Expand/Collapse Button -->
      <button
        v-if="node.has_children"
        class="mr-2 p-1 rounded hover:bg-gray-200"
        @click.stop="handleToggle"
      >
        <svg
          :class="[
            'w-4 h-4 text-gray-500 transition-transform duration-200',
            isExpanded ? 'transform rotate-90' : ''
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <!-- Spacer for nodes without children -->
      <div v-else class="w-6 mr-2"></div>
      
      <!-- Connection Lines -->
      <div v-if="level > 0" class="absolute left-0 flex items-center">
        <!-- Vertical line from parent -->
        <div 
          class="border-l-2 border-gray-300"
          :style="{ 
            height: '24px',
            marginLeft: `${(level - 1) * 24 + 12}px`,
            marginTop: '-12px'
          }"
        ></div>
        
        <!-- Horizontal line to node -->
        <div 
          class="border-t-2 border-gray-300"
          :style="{ 
            width: '12px',
            marginLeft: `${(level - 1) * 24 + 12}px`
          }"
        ></div>
      </div>
      
      <!-- Organization Info -->
      <div class="flex items-center space-x-3 flex-1">
        <OrganizationAvatar :organization="node.organization" size="sm" />
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h4 class="text-sm font-medium text-gray-900 truncate">
              {{ node.organization.name }}
            </h4>
            <OrganizationTypeChip :type="node.organization.type" size="sm" />
          </div>
          
          <div class="flex items-center space-x-4 mt-1">
            <span v-if="node.organization.industry" class="text-xs text-gray-500 truncate">
              {{ node.organization.industry }}
            </span>
            <span v-if="node.children.length > 0" class="text-xs text-gray-500">
              {{ node.children.length }} child{{ node.children.length !== 1 ? 'ren' : '' }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="flex items-center space-x-4 text-xs text-gray-500">
        <div class="text-center">
          <div class="font-medium text-gray-900">{{ getContactCount() }}</div>
          <div>Contacts</div>
        </div>
        <div class="text-center">
          <div class="font-medium text-gray-900">{{ getOpportunityCount() }}</div>
          <div>Opportunities</div>
        </div>
      </div>
      
      <!-- Action Buttons (shown on hover) -->
      <div class="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="$emit('view', node.organization.id)"
          class="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
          title="View details"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        
        <button
          @click.stop="$emit('edit', node.organization.id)"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="Edit organization"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        <button
          @click.stop="$emit('add-child', node.organization.id)"
          class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
          title="Add child organization"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Child Nodes -->
    <div v-if="isExpanded && node.children.length > 0" class="relative">
      <!-- Vertical connecting line for children -->
      <div 
        v-if="level >= 0"
        class="absolute border-l-2 border-gray-300"
        :style="{ 
          left: `${level * 24 + 12}px`,
          top: '0px',
          height: `${node.children.length * 60}px`
        }"
      ></div>
      
      <HierarchyNode
        v-for="(child, index) in node.children"
        :key="child.organization.id"
        :node="child"
        :level="level + 1"
        :expanded-nodes="expandedNodes"
        :is-last-child="index === node.children.length - 1"
        @toggle="$emit('toggle', $event)"
        @view="$emit('view', $event)"
        @edit="$emit('edit', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganizationAvatar from '../atomic/OrganizationAvatar.vue'
import OrganizationTypeChip from '../atomic/OrganizationTypeChip.vue'
import type { OrganizationTree } from '@/types'

interface Props {
  node: OrganizationTree
  level: number
  expandedNodes: Set<string>
  isLastChild?: boolean
}

interface Emits {
  (e: 'toggle', nodeId: string): void
  (e: 'view', nodeId: string): void
  (e: 'edit', nodeId: string): void
  (e: 'add-child', nodeId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  isLastChild: false
})

const emit = defineEmits<Emits>()

// Computed properties
const isExpanded = computed(() => props.expandedNodes.has(props.node.organization.id))

// Methods
const handleToggle = () => {
  if (props.node.has_children) {
    emit('toggle', props.node.organization.id)
  } else {
    emit('view', props.node.organization.id)
  }
}

const getContactCount = (): number => {
  // In a real implementation, this would come from the organization data
  // For now, we'll return a mock value or use existing contact data
  return props.node.organization.contacts?.length || 0
}

const getOpportunityCount = (): number => {
  // In a real implementation, this would come from the organization data
  // For now, we'll return a mock value or use existing opportunity data
  return props.node.organization.opportunities?.length || 0
}
</script>

<style scoped>
/* Ensure proper line positioning */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

/* Smooth hover transitions */
.group:hover .opacity-0 {
  opacity: 1;
}

/* Connection line styling */
.border-gray-300 {
  border-color: #d1d5db;
}
</style>