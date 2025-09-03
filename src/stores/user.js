import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useSupabase } from '../composables/useSupabase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const ghostUser = ref(false)
  const isLoading = ref(false)
  const { user: spUser, initializeAuthSpBase, isLoading: spLoading, signOutSpBase, supabase } = useSupabase()

  // Initialize user from localStorage
  const initializeAuth = async () => {
    initializeAuthSpBase()
    await syncSessions()
  }

  // Synchronize sessions between Supabase and localStorage
  async function syncSessions() {
    if (!user.value?.id) return
    try {
      const supabaseSessions = await fetchSessionsByuser_id(user.value.id)
      const localSessions = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')

      // Create a map for quick lookup
      const localSessionIds = new Set(localSessions.map(s => s.id))
      const supabaseSessionIds = new Set(supabaseSessions.map(s => s.id))

      // Find sessions in localStorage not in Supabase
      const sessionsToInsert = localSessions.filter(s => !supabaseSessionIds.has(s.id))

      // Insert missing local sessions into Supabase
      if (sessionsToInsert.length > 0) {
        const { error } = await supabase.from('sessions').insert(sessionsToInsert)
        if (error) throw error
      }

      // Merge sessions from Supabase and localStorage
      const mergedSessions = [...supabaseSessions]
      localSessions.forEach(localSession => {
        if (!supabaseSessionIds.has(localSession.id)) {
          mergedSessions.push(localSession)
        }
      })

      // Update localStorage with merged sessions
      localStorage.setItem('vodastate_sessions', JSON.stringify(mergedSessions))
    } catch (error) {
      console.error('Error synchronizing sessions:', error)
    }
  }

  watch([spUser, spLoading], ([val]) => {
    user.value = val
  })

  function signInGostMode() {
    ghostUser.value = true;
  }

  async function signOut() {
    if (!ghostUser.value) {
      await signOutSpBase()
    } else {
      ghostUser.value = false
      localStorage.removeItem('vodastate_user')
    }
    user.value = null
  }

  async function fetchSessionsByuser_id(user_id) {
    if (!user_id) return []
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user_id)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sessions from Supabase:', error)
      return []
    }
  }

  async function getSessions() {
    if (ghostUser.value) {
      // Fallback to localStorage if gost user
      const localSessions = localStorage.getItem('vodastate_sessions')
      const parsedSession =  localSessions ? JSON.parse(localSessions) : []
      return parsedSession.filter(ses => !ses.user_id)
    }
    else if (!user.value?.id) return []
    try {
      const sessions = await fetchSessionsByuser_id(user.value.id)
      if (sessions && sessions.length > 0) {
        localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
        return sessions
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      // Fallback to localStorage on error
      const localSessions = localStorage.getItem('vodastate_sessions')
      return localSessions ? JSON.parse(localSessions) : []
    }
  }

  async function saveSession(sessionData) {
    const newSession = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      user_id: user.value?.id,
      ...sessionData
    }
    try {
      // Update localStorage with new session
      let sessions = await getSessions()
      // Avoid duplicate session if already present
      if (sessions && !sessions.find(s => s.id === newSession.id)) {
        sessions.push(newSession)
      }
      if (!ghostUser.value) {
        const { data, error } = await supabase
          .from('sessions')
          .insert([newSession])
        if (error) throw error
      }
 
      localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
      return newSession
    } catch (error) {
      console.error('Error saving session to Supabase:', error)
      // Fallback to localStorage only
      const sessions = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
      if (!sessions.find(s => s.id === newSession.id)) {
        sessions.push(newSession)
      }
      localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
      return newSession
    }
  }

  async function deleteSession(user_id) {
    
    if (!ghostUser.value && !user_id) return false

    try {
      const sessions = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
      if (user_id) {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('user_id', user_id)
        if (error) throw error
        // Remove from localStorage
        const filteredSessions = sessions.filter(s => s.user_id !== user_id)
        localStorage.setItem('vodastate_sessions', JSON.stringify(filteredSessions))
      } else if (ghostUser.value) {
        const filteredSessions = sessions.filter(s => !s.hasOwnProperty('user_id'))
        localStorage.setItem('vodastate_sessions', JSON.stringify(filteredSessions))
      }
      return true
    } catch (error) {
      console.error('Error deleting sessions from Supabase:', error)
      // Fallback: remove from localStorage only
      if(user_id) {
        const sessions = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
        const filteredSessions = sessions.filter(s => s.user_id !== user_id)
        localStorage.setItem('vodastate_sessions', JSON.stringify(filteredSessions))
      }
      return false
    }
  }

  // Initialize on store creation
  initializeAuth()

  return {
    user,
    ghostUser,
    isLoading,
    signInGostMode,
    signOut,
    saveSession,
    deleteSession,
    getSessions,
    syncSessions
  }
})