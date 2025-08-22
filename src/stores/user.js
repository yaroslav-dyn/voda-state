import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const ghostUser = ref(false)
  const isLoading = ref(false)

  // Initialize user from localStorage
  function initializeAuth() {
    const savedUser = localStorage.getItem('vodastate_user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  async function signInWithGoogle() {
    isLoading.value = true

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    user.value = null
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


  function signInGostMode () {
    ghostUser.value = true;
  }

  async function signOut() {
    user.value = null
    ghostUser.value = false
    localStorage.removeItem('vodastate_user')
    // localStorage.removeItem('vodastate_sessions')
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
      createdAt: new Date().toISOString()
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
    signInWithGoogle,
    signInGostMode,
    signOut,
    saveSession,
    getSessions: () => getSessionsByUserId(user.value?.id),
    initializeAuth
  }
})