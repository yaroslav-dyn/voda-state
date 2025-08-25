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

  // Mock authentication for development
  // In production, this would integrate with Supabase
  const signInWithGoogle = async () => {
    isLoading.value = true
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    user.value = null;
    // Mock user data
    user.value = {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Demo User',
      avatar: null
    }
    
    isLoading.value = false
    
    // Store in localStorage for persistence
    localStorage.setItem('vodastate_user', JSON.stringify(user.value))
  }

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

  // Initialize user from localStorage
  // const initializeAuth = () => {
  //   const savedUser = localStorage.getItem('vodastate_user')
  //   if (savedUser) {
  //     user.value = JSON.parse(savedUser)
  //   }
  // }

  // Session management
  const saveSession = async (sessionData) => {
    const sessions = getSessions()
    const newSession = {
      id: Date.now().toString(),
      userId: user.value?.id,
      ...sessionData,
      createdAt: new Date().toISOString()
    }
    
    sessions.push(newSession)
    localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
    return newSession
  }

  const getSessions = () => {
    const sessions = localStorage.getItem('vodastate_sessions')
    return sessions ? JSON.parse(sessions) : []
  }

  const getSessionsByUserId = (userId) => {
    const sessions = getSessions()
    return sessions.filter(session => session.userId === userId)
  }

  // Initialize on module load
  //initializeAuth()

  return {
    supabase,
    user,
    isLoading,
    signInWithGoogle,
    signOutSpBase,
    saveSession,
    getSessions: () => getSessionsByUserId(user.value?.id),
    initializeAuthSpBase
  }
}
