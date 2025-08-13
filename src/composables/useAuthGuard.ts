import { useAuthStore } from '@/stores/authStore'
import type { NavigationGuard } from 'vue-router'

export const requireAuth: NavigationGuard = async (_to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth state to be determined if still loading
  if (authStore.loading) {
    // Wait a bit for auth to initialize
    await new Promise(resolve => {
      const checkAuth = () => {
        if (!authStore.loading) {
          resolve(void 0)
        } else {
          setTimeout(checkAuth, 100)
        }
      }
      checkAuth()
    })
  }
  
  if (authStore.isAuthenticated) {
    next()
  } else {
    next('/login')
  }
}

export const redirectIfAuthenticated: NavigationGuard = async (_to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth state to be determined if still loading
  if (authStore.loading) {
    await new Promise(resolve => {
      const checkAuth = () => {
        if (!authStore.loading) {
          resolve(void 0)
        } else {
          setTimeout(checkAuth, 100)
        }
      }
      checkAuth()
    })
  }
  
  if (authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
}