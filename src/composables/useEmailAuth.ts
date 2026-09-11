import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import type { IAuthResult, IUser } from '@/types'

export const useAuth = () => {
  const { supabase } = useSupabase()
  const user = ref<IUser | null>(null)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  const signUp = async (email: string, password: string): Promise<IAuthResult> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email: string, password: string): Promise<IAuthResult> => {
    try {
      loading.value = true
      error.value = null
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      const supabaseUser = data.user
      if (supabaseUser) {
        user.value = {
          ...supabaseUser,
          id: supabaseUser.id,
          email: supabaseUser.email ?? '',
        } as IUser
      }
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      error.value = message
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email: string): Promise<IAuthResult> => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      error.value = message
      return { success: false, error: message }
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