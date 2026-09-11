<template>
  <div id="app" :class="themeClass">
    <!-- Offline Indicator -->
    <div v-if="!isOnline" class="offline-banner pixel-text">
      <span class="icon_emoji">📴</span> Offline mode — sessions saved locally
    </div>

    <!-- Sync Prompt Modal -->
    <div v-if="showSyncPrompt" class="sync-prompt-overlay">
      <div class="sync-prompt-modal">
        <h3 class="pixel-text">Sync Offline Sessions?</h3>
        <p class="pixel-text">
          You have {{ pendingSyncCount }} session(s) saved offline.
          Sync them to your account?
        </p>
        <div class="sync-prompt-actions">
          <button @click="handleSyncNow" class="pixel-btn sync-btn --primary">Sync Now</button>
          <button @click="handleKeepLocal" class="pixel-btn sync-btn --secondary">Keep Local</button>
        </div>
      </div>
    </div>

    <div class="app-container">
      <!--SECTION: Header -->
      <header class="app-header">
        <div class="app-header__logo">
          <img class="d_logo" :src="dropLogo" :alt="appName" />
          <h1 class="app-title pixel-text --text-primary-blue isolated-color">{{ appName }}</h1>
        </div>
        <div :class="['user-info', { '--ghost-user': ghostUser }]" v-if="!isLoading && (user || ghostUser)">
          <span v-if="!ghostUser" class="user-info__nick pixel-text">{{ user?.email }}</span>

          <div class="user-info__mbottom">
            <button v-if="user" @click="signOut" class="user-info__button pixel-btn pixel-btn-small">Sign Out</button>
            <button v-if="ghostUser" @click="signOut" class="user-info__button pixel-btn pixel-btn-small">Exit</button>

            <button @click="openSettings" class="user-info__settings plane-btn settings-icon">
              <span class="icon_emoji --x-big --bold --text-modern-dark --night-invert">⛭</span>
            </button>
          </div>
        </div>
      </header>

      <!--SECTION: Main Content -->
      <main class="main-content">
        <Auth v-if="!user && !ghostUser" @user-authenticated="handleUserAuth" />

        <div v-else-if="!isLoading" class="app-dashboard">
          <!-- Motivation Message -->
          <div class="motivation-message --invert-bg">
            <p class="pixel-text motivation-text">{{ currentMessage }}</p>
          </div>

          <!-- Timer Section -->
          <section class="timer-section">
            <Timer
              @session-complete="handleSessionComplete"
              @session-start="handleSessionStart"
              @progress-update="updateTimerProgress"
            />
          </section>

          <!-- Bottle Section -->
          <section class="bottle-section">
            <Bottle :fill-percentage="timerProgress" :is-active="isTimerActive" />
          </section>

          <!-- Stats Section -->
          <section class="stats-section">
            <Stats :sessions="userSessions" @session-delete="deleteSessionHandler" />
          </section>
        </div>
      </main>

      <Transition name="slide-rihgt">
        <Settings v-if="isSettingsOpen" :isSettingsOpen="isSettingsOpen" @close-modal="() => (isSettingsOpen = false)" />
      </Transition>

      <!--SECTION: Water Drop Animations -->
      <section class="water-drops" v-if="showDrops">
        <div class="water-drop" v-for="n in 3" :key="n" :style="{ '--delay': n * 0.5 + 's' }"></div>
      </section>
    </div>
  </div>

  <footer :class="['app-footer', themeClass]">
    <small class="pixel-text">©{{ currentYear }} {{ appName }}. {{ version }}v</small>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import Timer from './components/Timer.vue'
import Bottle from './components/Bottle.vue'
import Stats from './components/Stats.vue'
import Auth from './components/Auth.vue'
import { useMotivation } from '@/composables/useMotivation'
import { getTimeOfDay } from '@/utils/timeUtils'
import { useUserStore } from '@/stores'
import { storeToRefs } from 'pinia'
const dropLogo = '/img/drop_timer_512px.png'
import Settings from './components/Settings.vue'
import { version } from '../package.json'
import type { ISession, TSessionType } from '@/types'

const APP_NAME = import.meta.env.VITE_APP_NAME

const userStore = useUserStore()
const { user, ghostUser, isLoading } = storeToRefs(userStore)

const signOut = userStore.signOut
const getSessions = userStore.getSessions
const saveSession = userStore.saveSession
const deleteSession = userStore.deleteSession
const syncSessions = userStore.syncSessions
const { getMessage } = useMotivation()

const appName = ref<string>(APP_NAME)
const timerProgress = ref<number>(0)
const isTimerActive = ref<boolean>(false)
const showDrops = ref<boolean>(false)
const isUserLogged = ref<boolean>(false)
const userSessions = ref<ISession[]>([])
const isSettingsOpen = ref<boolean>(false)
const currentMessage = ref<string>(`Welcome to ${APP_NAME}! Stay hydrated and focused.`)

// Offline detection & sync
const isOnline = ref<boolean>(navigator.onLine)
const showSyncPrompt = ref<boolean>(false)
const pendingSyncCount = ref<number>(0)

const currentYear = computed((): number => {
  const currentDate = new Date()
  return currentDate.getFullYear()
})

const checkPendingSyncSessions = (): number => {
  try {
    const sessions: ISession[] = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
    return sessions.filter((s) => s.user_id && !s.synced).length
  } catch {
    return 0
  }
}

const handleOnline = (): void => {
  isOnline.value = true
  const pending = checkPendingSyncSessions()
  if (pending > 0 && user.value?.id) {
    pendingSyncCount.value = pending
    showSyncPrompt.value = true
  }
}

const handleOffline = (): void => {
  isOnline.value = false
  showSyncPrompt.value = false
}

const handleSyncNow = async (): Promise<void> => {
  showSyncPrompt.value = false
  try {
    await syncSessions()
    const sessions: ISession[] = JSON.parse(localStorage.getItem('vodastate_sessions') || '[]')
    sessions.forEach((s) => { if (s.user_id) s.synced = true })
    localStorage.setItem('vodastate_sessions', JSON.stringify(sessions))
    currentMessage.value = 'Sessions synced successfully! 🌊'
  } catch (error) {
    console.error('Sync failed:', error)
    currentMessage.value = 'Sync failed. Sessions kept locally. ⚠️'
  }
}

const handleKeepLocal = (): void => {
  showSyncPrompt.value = false
}

const themeClass = computed((): string => {
  const timeOfDay = getTimeOfDay()
  return `theme-${timeOfDay}`
})

const handleUserAuth = (userData: { email: string }): void => {
  currentMessage.value = getMessage('welcome')
  isUserLogged.value = !!userData
  loadUserSessions()
}

const handleSessionStart = (sessionType: TSessionType): void => {
  isTimerActive.value = true
  showDrops.value = true
  currentMessage.value = getMessage('session_start', sessionType)
}

const handleSessionComplete = async (sessionData: {
  type: TSessionType
  duration: number
  completed: boolean
  completed_at: string
}): Promise<void> => {
  isTimerActive.value = false
  showDrops.value = false
  timerProgress.value = 0

  currentMessage.value = getMessage('session_complete', sessionData.type)
  await saveSession(sessionData)
  await loadUserSessions()
}

const loadUserSessions = async (): Promise<void> => {
  try {
    const sessions = await getSessions()
    userSessions.value = sessions || []
  } catch (error) {
    console.error('Failed to load sessions:', error)
  }
}

const deleteSessionHandler = async (): Promise<void> => {
  const res = await deleteSession(user.value?.id)
  if (res) {
    await loadUserSessions()
  }
}

const updateTimerProgress = (progress: number): void => {
  timerProgress.value = progress
  if (progress === 25) {
    currentMessage.value = getMessage('quarter_progress')
  } else if (progress === 50) {
    currentMessage.value = getMessage('half_progress')
  } else if (progress === 75) {
    currentMessage.value = getMessage('three_quarter_progress')
  }
}

const openSettings = (): void => {
  isSettingsOpen.value = !isSettingsOpen.value
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

watchEffect(async () => {
  await loadUserSessions()
})
</script>

<style scoped>
.app-footer {
  text-align: center;
  padding: 1rem 0;
  font-size: 0.875rem;
  border-top: 1px solid var(--border-color);
  background-color: transparent;
}

.app-footer small {
  font-size: 0.65rem;
}

.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: #f59e0b;
  color: #1f2937;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.75rem;
}

.sync-prompt-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.sync-prompt-modal {
  background: #f0f8ff;
  border: 3px solid #4a90e2;
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 360px;
  width: 100%;
  text-align: center;
}

.sync-prompt-modal h3 {
  color: #4a90e2;
  margin-bottom: 0.75rem;
}

.sync-prompt-modal p {
  color: #374151;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}

.sync-prompt-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.sync-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.sync-btn.--primary {
  background: #4a90e2;
  color: white;
}

.sync-btn.--secondary {
  background: #e5e7eb;
  color: #374151;
}
</style>