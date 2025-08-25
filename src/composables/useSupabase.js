import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_APP_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_APP_SUPABASE_KEY
const SUPABASE_CALLBACK_URL = import.meta.env.VITE_APP_SUPABASE_CALLBACK_URL


const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export function useSupabase() {

  const user = ref(null)
  const isLoading = ref(false)

  // Initialize auth state
  const initializeAuthSpBase = async () => {
    isLoading.value = true
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
      isLoading.value = false
    }
  }

  //TODO: Next releases.
  const handleSignInWithGoogle = async(response) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: SUPABASE_CALLBACK_URL
      },
    })
    return {data, error}
  }

  const signOutSpBase = async () => {
    try {
      isLoading.value = true
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      user.value = null
      return { success: true }
    } catch (err) {
      err.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    supabase,
    user,
    isLoading,
    signOutSpBase,
    initializeAuthSpBase
  }
}
