import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { requireAuth, redirectIfAuthenticated } from '@/composables/useAuthGuard'

// Direct imports to avoid dynamic import issues
import Login from '@/views/auth/Login.vue'
import Dashboard from '@/views/Dashboard.vue'

// Organization views
import OrganizationsList from '@/views/organizations/OrganizationsList.vue'
import OrganizationDetails from '@/views/organizations/OrganizationDetails.vue'
import OrganizationForm from '@/views/organizations/OrganizationForm.vue'
import OrganizationHierarchy from '@/views/organizations/OrganizationHierarchy.vue'

// Contact views
import ContactsList from '@/views/contacts/ContactsList.vue'

// Product views
import ProductsList from '@/views/products/ProductsList.vue'

// Opportunity views
import OpportunitiesList from '@/views/opportunities/OpportunitiesList.vue'

// Interaction views
import InteractionsList from '@/views/interactions/InteractionsList.vue'

// Relationship Progression views
import RelationshipProgressionList from '@/views/relationshipProgression/RelationshipProgressionList.vue'
import RelationshipProgressionDetails from '@/views/relationshipProgression/RelationshipProgressionDetails.vue'
import RelationshipProgressionAnalytics from '@/views/relationshipProgression/RelationshipProgressionAnalytics.vue'
import RelationshipProgressionMilestone from '@/views/relationshipProgression/RelationshipProgressionMilestone.vue'
import RelationshipProgressionActivity from '@/views/relationshipProgression/RelationshipProgressionActivity.vue'

const routes: RouteRecordRaw[] = [
  // Auth routes
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: redirectIfAuthenticated,
  },
  
  // Protected routes
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth,
  },
  
  // Organization routes
  {
    path: '/organizations',
    name: 'organizations-list',
    component: OrganizationsList,
    beforeEnter: requireAuth,
  },
  {
    path: '/organizations/new',
    name: 'organization-create',
    component: OrganizationForm,
    beforeEnter: requireAuth,
  },
  {
    path: '/organizations/hierarchy',
    name: 'organizations-hierarchy',
    component: OrganizationHierarchy,
    beforeEnter: requireAuth,
  },
  {
    path: '/organizations/:id',
    name: 'organization-details',
    component: OrganizationDetails,
    beforeEnter: requireAuth,
  },
  {
    path: '/organizations/:id/edit',
    name: 'organization-edit',
    component: OrganizationForm,
    beforeEnter: requireAuth,
  },
  
  // Contact routes
  {
    path: '/contacts',
    name: 'contacts-list',
    component: ContactsList,
    beforeEnter: requireAuth,
  },
  
  // Product routes
  {
    path: '/products',
    name: 'products-list',
    component: ProductsList,
    beforeEnter: requireAuth,
  },
  
  // Opportunity routes
  {
    path: '/opportunities',
    name: 'opportunities-list',
    component: OpportunitiesList,
    beforeEnter: requireAuth,
  },
  
  // Interaction routes
  {
    path: '/interactions',
    name: 'interactions-list',
    component: InteractionsList,
    beforeEnter: requireAuth,
  },
  
  // Relationship Progression routes
  {
    path: '/relationships/progression',
    name: 'relationship-progression-list',
    component: RelationshipProgressionList,
    beforeEnter: requireAuth,
  },
  {
    path: '/relationships/progression/:id',
    name: 'relationship-progression-details',
    component: RelationshipProgressionDetails,
    beforeEnter: requireAuth,
  },
  {
    path: '/relationships/progression/:id/analytics',
    name: 'relationship-progression-analytics',
    component: RelationshipProgressionAnalytics,
    beforeEnter: requireAuth,
  },
  {
    path: '/relationships/progression/:id/milestones/add',
    name: 'relationship-progression-milestone',
    component: RelationshipProgressionMilestone,
    beforeEnter: requireAuth,
  },
  {
    path: '/relationships/progression/:id/milestones/:milestoneId/edit',
    name: 'relationship-progression-milestone-edit',
    component: RelationshipProgressionMilestone,
    beforeEnter: requireAuth,
  },
  {
    path: '/relationships/progression/:id/activities/add',
    name: 'relationship-progression-activity',
    component: RelationshipProgressionActivity,
    beforeEnter: requireAuth,
  },
  {
    path: '/relationships/progression/:id/activities/:activityId/edit',
    name: 'relationship-progression-activity-edit',
    component: RelationshipProgressionActivity,
    beforeEnter: requireAuth,
  },
  {
    path: '/relationships/progression/:id/health',
    name: 'relationship-progression-health',
    component: RelationshipProgressionDetails, // For now, redirect to details
    beforeEnter: requireAuth,
  },
  
  // Catch-all route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router