import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useSupabase } from '../composables/useSupabase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const ghostUser = ref(false)
  const isLoading = ref(false)
  const { user: spUser, initializeAuthSpBase, isLoading: spLoading, signOutSpBase } = useSupabase()

  // Initialize user from localStorage
  const initializeAuth = () => {
    initializeAuthSpBase()
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

  function getSessions() {
    const sessions = localStorage.getItem('vodastate_sessions')
    return sessions ? JSON.parse(sessions) : []
  }

  function getSessionsByUserId(userId) {
    const sessions = getSessions()
    return sessions.filter(session => session.userId === userId)
  }

  async function saveSession(sessionData) {
    const sessions = getSessions()

    const newSession = {
      id: Date.now().toString(),
      userId: user.value?.id,
      ...sessionData,
      // createdAt: new Date().toISOString()
    }

    sessions.push(newSession)
    localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
    return newSession
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
    getSessions: () => getSessionsByUserId(user.value?.id),
    initializeAuth
  }
})