<template>
  <div id="app" :class="themeClass">
    <div class="app-container">
      <!-- Header -->
      <header class="app-header">
        <h1 class="app-title pixel-text">💧 VodaState</h1>
        <div class="user-info" v-if="user">
          <span class="pixel-text">{{ user.email }}</span>
          <button @click="signOut" class="pixel-btn pixel-btn-small">Sign Out</button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <Auth v-if="!user" @user-authenticated="handleUserAuth" />
        
        <div v-else class="app-dashboard">
          <!-- Timer Section -->
          <section class="timer-section">
            <Timer 
              @session-complete="handleSessionComplete"
              @session-start="handleSessionStart"
            />
          </section>

          <!-- Bottle Section -->
          <section class="bottle-section">
            <Bottle :fill-percentage="timerProgress" :is-active="isTimerActive" />
          </section>

          <!-- Motivation Message -->
          <div class="motivation-message">
            <p class="pixel-text motivation-text">{{ currentMessage }}</p>
          </div>

          <!-- Stats Section -->
          <section class="stats-section">
            <Stats :sessions="userSessions" />
          </section>
        </div>
      </main>

      <!-- Water Drop Animations -->
      <div class="water-drops" v-if="showDrops">
        <div class="water-drop" v-for="n in 3" :key="n" :style="{ '--delay': n * 0.5 + 's' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import Timer from './components/Timer.vue'
import Bottle from './components/Bottle.vue'
import Stats from './components/Stats.vue'
import Auth from './components/Auth.vue'
import { useSupabase } from './composables/useSupabase'
import { useMotivation } from './composables/useMotivation'
import { getTimeOfDay } from './utils/timeUtils'

export default {
  name: 'App',
  components: {
    Timer,
    Bottle,
    Stats,
    Auth
  },
  setup() {
    const { user, signOut, getSessions } = useSupabase()
    const { getMessage } = useMotivation()
    
    const timerProgress = ref(0)
    const isTimerActive = ref(false)
    const showDrops = ref(false)
    const userSessions = ref([])
    const currentMessage = ref('Welcome to HydroFocus! Stay hydrated and focused.')

    // Theme based on time of day
    const themeClass = computed(() => {
      const timeOfDay = getTimeOfDay()
      return `theme-${timeOfDay}`
    })

    // Handle user authentication
    const handleUserAuth = (userData) => {
      loadUserSessions()
      currentMessage.value = getMessage('welcome', userData.email)
    }

    // Handle session events
    const handleSessionStart = (sessionType) => {
      isTimerActive.value = true
      showDrops.value = true
      currentMessage.value = getMessage('session_start', sessionType)
    }

    const handleSessionComplete = async (sessionData) => {
      isTimerActive.value = false
      showDrops.value = false
      timerProgress.value = 0
      
      currentMessage.value = getMessage('session_complete', sessionData.type)
      
      // Save session to database
      await saveSession(sessionData)
      await loadUserSessions()
    }

    // Load user sessions
    const loadUserSessions = async () => {
      try {
        const sessions = await getSessions()
        userSessions.value = sessions
      } catch (error) {
        console.error('Failed to load sessions:', error)
      }
    }

    // Save session
    const saveSession = async (sessionData) => {
      // This would integrate with Supabase to save session data
      console.log('Saving session:', sessionData)
    }

    // Watch for timer progress updates
    const updateTimerProgress = (progress) => {
      timerProgress.value = progress
      
      // Show motivational messages at certain progress points
      if (progress === 25) {
        currentMessage.value = getMessage('quarter_progress')
      } else if (progress === 50) {
        currentMessage.value = getMessage('half_progress')
      } else if (progress === 75) {
        currentMessage.value = getMessage('three_quarter_progress')
      }
    }

    onMounted(() => {
      if (user.value) {
        loadUserSessions()
      }
    })

    return {
      user,
      signOut,
      themeClass,
      timerProgress,
      isTimerActive,
      showDrops,
      userSessions,
      currentMessage,
      handleUserAuth,
      handleSessionStart,
      handleSessionComplete,
      updateTimerProgress
    }
  }
}
</script>
