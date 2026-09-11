import { ref } from 'vue'
import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_APP_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_APP_SUPABASE_KEY

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)

export function useSupabase() {
  const user = ref<User | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const initializeAuthSpBase = async (): Promise<void> => {
    isLoading.value = true
    try {
      const { data: { session } }: { data: { session: Session | null } } = await supabase.auth.getSession()
      user.value = session?.user ?? null

      supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
        user.value = session?.user ?? null

        if (_event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email)
        } else if (_event === 'SIGNED_OUT') {
          console.log('User signed out')
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  const signOutSpBase = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      isLoading.value = true
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      user.value = null
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    supabase,
    user,
    isLoading,
    error,
    signOutSpBase,
    initializeAuthSpBase
  }
}