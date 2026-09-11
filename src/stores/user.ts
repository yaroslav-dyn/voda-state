import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { IUser, ISession } from '@/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<IUser | null>(null)
  const ghostUser = ref<boolean>(false)
  const isLoading = ref<boolean>(false)

  const { user: spUser, initializeAuthSpBase, isLoading: spLoading, signOutSpBase, supabase } = useSupabase()

  const initializeAuth = async (): Promise<void> => {
    initializeAuthSpBase()
    await syncSessions()
  }

  async function syncSessions(): Promise<void> {
    if (!user.value?.id) return
    try {
      const supabaseSessions = await fetchSessionsByUserId(user.value.id)
      const localSessions: ISession[] = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')

      const supabaseSessionIds = new Set(supabaseSessions.map((s) => s.id))

      const sessionsToInsert = localSessions.filter((s) => !supabaseSessionIds.has(s.id))

      if (sessionsToInsert.length > 0) {
        const { error } = await supabase.from('sessions').insert(sessionsToInsert)
        if (error) throw error
      }

      const mergedSessions = [...supabaseSessions]
      localSessions.forEach((localSession) => {
        if (!supabaseSessionIds.has(localSession.id)) {
          mergedSessions.push(localSession)
        }
      })

      localStorage.setItem('vodastate_sessions', JSON.stringify(mergedSessions))
    } catch (error) {
      console.error('Error synchronizing sessions:', error)
    }
  }

  watch([spUser, spLoading], ([val]) => {
    if (val) {
      user.value = {
        ...val,
        id: val.id,
        email: val.email ?? '',
      } as IUser
    } else {
      user.value = null
    }
  })

  function signInGhostMode(): void {
    ghostUser.value = true
  }

  async function signOut(): Promise<void> {
    if (!ghostUser.value) {
      await signOutSpBase()
    } else {
      ghostUser.value = false
      localStorage.removeItem('vodastate_user')
    }
    user.value = null
  }

  async function fetchSessionsByUserId(userId: string): Promise<ISession[]> {
    if (!userId) return []
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sessions from Supabase:', error)
      return []
    }
  }

  async function getSessions(): Promise<ISession[]> {
    if (ghostUser.value) {
      const localSessions = localStorage.getItem('vodastate_sessions')
      const parsedSession: ISession[] = localSessions ? JSON.parse(localSessions) : []
      return parsedSession.filter((ses) => !ses.user_id)
    } else if (!user.value?.id) return []

    try {
      const sessions = await fetchSessionsByUserId(user.value.id)
      if (sessions && sessions.length > 0) {
        localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
        return sessions
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      const localSessions = localStorage.getItem('vodastate_sessions')
      return localSessions ? JSON.parse(localSessions) : []
    }
    return []
  }

  async function saveSession(sessionData: Partial<ISession>): Promise<ISession> {
    const newSession: ISession = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      user_id: user.value?.id,
      type: sessionData.type || 'work',
      duration: sessionData.duration || 0,
      completed: sessionData.completed || false,
      completed_at: sessionData.completed_at || new Date().toISOString(),
      ...sessionData
    } as ISession

    try {
      let sessions = await getSessions()
      if (sessions && !sessions.find((s) => s.id === newSession.id)) {
        sessions.push(newSession)
      }
      if (!ghostUser.value) {
        const { error } = await supabase.from('sessions').insert([newSession])
        if (error) throw error
      }

      localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
      return newSession
    } catch (error) {
      console.error('Error saving session to Supabase:', error)
      const sessions: ISession[] = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
      if (!sessions.find((s) => s.id === newSession.id)) {
        sessions.push(newSession)
      }
      localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
      return newSession
    }
  }

  async function deleteSession(userId?: string): Promise<boolean> {
    if (!ghostUser.value && !userId) return false

    try {
      const sessions: ISession[] = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
      if (userId) {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('user_id', userId)
        if (error) throw error
        const filteredSessions = sessions.filter((s) => s.user_id !== userId)
        localStorage.setItem('vodastate_sessions', JSON.stringify(filteredSessions))
      } else if (ghostUser.value) {
        const filteredSessions = sessions.filter((s) => !Object.prototype.hasOwnProperty.call(s, 'user_id'))
        localStorage.setItem('vodastate_sessions', JSON.stringify(filteredSessions))
      }
      return true
    } catch (error) {
      console.error('Error deleting sessions from Supabase:', error)
      if (userId) {
        const sessions: ISession[] = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
        const filteredSessions = sessions.filter((s) => s.user_id !== userId)
        localStorage.setItem('vodastate_sessions', JSON.stringify(filteredSessions))
      }
      return false
    }
  }

  initializeAuth()

  return {
    user,
    ghostUser,
    isLoading,
    signInGhostMode,
    signOut,
    saveSession,
    deleteSession,
    getSessions,
    syncSessions
  }
})