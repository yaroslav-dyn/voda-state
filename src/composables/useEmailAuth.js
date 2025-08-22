

// 3. Auth composable (composables/useAuth.js)
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../utils/supabaseClient'

export const useAuth = () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  // Sign up with email
  const signUp = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      // User will receive confirmation email
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in with email
  const signIn = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      user.value = data.user
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      loading.value = true
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      user.value = null
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        user.value = session?.user ?? null

        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session.user.email)
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    initAuth()
  })

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    initAuth
  }
}