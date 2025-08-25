

import { ref, computed, onMounted } from 'vue'
import { useSupabase } from './useSupabase'

export const useAuth = () => {
  const { supabase } = useSupabase()
  const user = ref(null)
  const loading = ref(false)
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

  //TODO: DEPRECATED: Sign out
  // const signOut = async () => {
  //   try {
  //     loading.value = true
  //     const { error: signOutError } = await supabase.auth.signOut()

  //     if (signOutError) throw signOutError

  //     user.value = null
  //     return { success: true }
  //   } catch (err) {
  //     error.value = err.message
  //     return { success: false, error: err.message }
  //   } finally {
  //     loading.value = false
  //   }
  // }

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

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signUp,
    signIn,
    resetPassword
  }
}