import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)
  const userEmail = computed(() => authStore.userEmail)

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      await authStore.signInWithEmail(email, password)
      // Redirect to dashboard after successful login
      router.push('/dashboard')
    } catch (err) {
      // Error is handled in the store
      console.error('Sign in failed:', err)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await authStore.signUpWithEmail(email, password)
      // You might want to show a message about email confirmation
      console.log('Sign up successful - check email for confirmation')
      // Automatically try to sign in after successful signup if session exists
      if (authStore.isAuthenticated) {
        router.push('/dashboard')
      }
    } catch (err) {
      // Error is handled in the store
      console.error('Sign up failed:', err)
    }
  }

  const signOut = async () => {
    try {
      await authStore.signOut()
      // Redirect to login page after sign out
      router.push('/login')
    } catch (err) {
      console.error('Sign out failed:', err)
    }
  }

  const clearError = () => {
    authStore.clearError()
  }

  // Utility methods
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      router.push('/login')
      return false
    }
    return true
  }

  const redirectIfAuthenticated = () => {
    if (isAuthenticated.value) {
      router.push('/dashboard')
      return true
    }
    return false
  }

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    userEmail,

    // Methods
    signIn,
    signUp,
    signOut,
    clearError,
    requireAuth,
    redirectIfAuthenticated,
  }
}