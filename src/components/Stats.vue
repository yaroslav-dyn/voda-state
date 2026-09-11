<template>
  <div class="stats-container --invert-bg">
    <h2 class="pixel-text stats-title">📊 Your Hydration Stats</h2>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-number pixel-text">{{ todaysSessions }}</div>
        <div class="stat-label pixel-text">Today</div>
      </div>

      <div class="stat-card">
        <div class="stat-number pixel-text">{{ thisWeekSessions }}</div>
        <div class="stat-label pixel-text">This Week</div>
      </div>

      <div class="stat-card">
        <div class="stat-number pixel-text">{{ totalSessions }}</div>
        <div class="stat-label pixel-text">Total</div>
      </div>

      <div class="stat-card">
        <div class="stat-number pixel-text">{{ currentStreak }}</div>
        <div class="stat-label pixel-text">Streak</div>
      </div>
    </div>

    <!-- Daily Goal Progress -->
    <div class="daily-goal">
      <h3 class="pixel-text">
        <span class="icon_emoji --medium">🎯</span>
        <span> Daily Goal (5 Sessions)</span>
      </h3>
      <div class="goal-progress">
        <div class="goal-bottles">
          <div
            v-for="n in 5"
            :key="n"
            class="goal-bottle"
            :class="{ completed: n <= todaysSessions }"
          >
            🍶
          </div>
        </div>
        <div class="goal-text pixel-text --night-invert">{{ todaysSessions }}/5 sessions completed today</div>
      </div>
    </div>

    <!-- Recent Sessions -->
    <div class="recent-sessions" v-if="recentSessions.length > 0">
      <h3 class="pixel-text">
        <span class="icon_emoji">🕐</span> Recent Sessions
      </h3>
      <div class="session-list">
        <div
          v-for="session in recentSessions"
          :key="session.id"
          class="session-item"
          :class="{ completed: session.completed }"
        >
          <div class="session-icon">{{ session.type === 'work' ? '💼' : '☕' }}</div>
          <div class="session-details">
            <div class="session-duration pixel-text --night-invert">{{ formatDuration(session.duration) }}</div>
            <div class="session-date pixel-text --night-invert">{{ formatDate(session.completed_at) }}</div>
          </div>
          <div class="pixel-text --night-invert hide__mobile">
            {{ formatLocalDate(session.created_at) }} - {{ formatLocalDate(session.completed_at) }}
          </div>
          <div class="session-status">{{ session.completed ? '✅' : '❌' }}</div>
        </div>
      </div>

      <div class="clear-session-container">
        <button class="clear-session-btn pixel-btn control-btn stop-btn" @click="onClearClick">
          <span>🛑</span> <span> Clear session </span>
        </button>
      </div>
    </div>

    <!-- Achievement System -->
    <div class="achievements" v-if="unlockedAchievements.length > 0">
      <h3 class="pixel-text">🏆 Achievements</h3>
      <div class="achievement-list">
        <div v-for="achievement in unlockedAchievements" :key="achievement.id" class="achievement-item">
          <div class="achievement-icon">{{ achievement.icon }}</div>
          <div class="achievement-info">
            <div class="achievement-title pixel-text --night-invert">{{ achievement.title }}</div>
            <div class="achievement-description pixel-text --night-invert">{{ achievement.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-if="totalSessions === 0">
      <div class="empty-icon">🌱</div>
      <p class="pixel-text">Start your first session to begin tracking your productivity journey!</p>
    </div>

    <MessageDisplay
      v-if="showClearConfirm"
      type="error"
      render="fixed"
      classes="clear-confirm-message"
    >
      <div>{{ clearMessage }}</div>
      <div class="clear-confirm-controlls">
        <button @click="confirmClear(false)" class="cancel-btn pixel-btn control-btn stop-btn">No</button>
        <button @click="confirmClear(true)" class="confirm-btn pixel-btn control-btn start-btn">Yes</button>
      </div>
    </MessageDisplay>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MessageDisplay from './MessageDisplay.vue'
import type { ISession } from '@/types'

interface StatsProps {
  sessions: ISession[]
}

const props = defineProps<StatsProps>()

const emit = defineEmits<{
  'session-delete': []
}>()

function formatLocalDate(dateString: string): string {
  return new Date(dateString).toLocaleTimeString()
}

const todaysSessions = computed((): number => {
  const today = new Date().toDateString()
  return props.sessions?.filter((session) => {
    const sessionDate = new Date(session.completed_at).toDateString()
    return sessionDate === today && session.completed
  }).length ?? 0
})

const thisWeekSessions = computed((): number => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  return props.sessions?.filter((session) => {
    const sessionDate = new Date(session.completed_at)
    return sessionDate >= oneWeekAgo && session.completed
  }).length ?? 0
})

const totalSessions = computed((): number => {
  return props.sessions?.filter((session) => session.completed).length ?? 0
})

const currentStreak = computed((): number => {
  if (!props.sessions || props.sessions.length === 0) return 0

  let streak = 0
  const today = new Date()
  let checkDate = new Date(today)

  while (true) {
    const dayString = checkDate.toDateString()
    const dayHasSessions = props.sessions.some((session) => {
      const sessionDate = new Date(session.completed_at).toDateString()
      return sessionDate === dayString && session.completed
    })

    if (!dayHasSessions) break

    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
})

const recentSessions = computed((): ISession[] => {
  return [...(props.sessions || [])]
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 10)
})

const unlockedAchievements = computed(() => {
  const achievements: Array<{ id: string; icon: string; title: string; description: string }> = []
  const completedSessions = totalSessions.value

  if (completedSessions >= 1) {
    achievements.push({
      id: 'first_drop',
      icon: '💧',
      title: 'First Drop',
      description: 'Completed your first session'
    })
  }

  if (completedSessions >= 10) {
    achievements.push({
      id: 'flowing_stream',
      icon: '🌊',
      title: 'Flowing Stream',
      description: 'Completed 10 sessions'
    })
  }

  if (completedSessions >= 50) {
    achievements.push({
      id: 'mighty_river',
      icon: '🏞️',
      title: 'Mighty River',
      description: 'Completed 50 sessions'
    })
  }

  if (currentStreak.value >= 7) {
    achievements.push({
      id: 'week_warrior',
      icon: '⚡',
      title: 'Week Warrior',
      description: '7 day streak'
    })
  }

  return achievements
})

const showClearConfirm = ref<boolean>(false)
const clearMessage = 'Are you sure you want to clear the session?'

function clearSession(): void {
  localStorage.removeItem('vodastate_sessions')
  emit('session-delete')
}

function onClearClick(): void {
  showClearConfirm.value = true
}

function confirmClear(confirmed: boolean): void {
  showClearConfirm.value = false
  if (confirmed) {
    clearSession()
  }
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}min`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`

  return date.toLocaleDateString()
}
</script>