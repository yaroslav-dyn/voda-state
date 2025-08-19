<template>
  <div class="timer-container">
    <!-- Timer Display -->
    <div class="timer-display">
      <div class="time-remaining pixel-text">
        {{ formattedTime }}
      </div>
      <div class="session-info">
        <span class="session-type pixel-text">{{ sessionTypeLabel }}</span>
        <span class="session-counter pixel-text">Session {{ sessionCount }}</span>
      </div>
    </div>

    <!-- Timer Presets -->
    <div class="timer-presets" v-if="!isActive">
      <h3 class="pixel-text">Work Sessions</h3>
      <div class="preset-group">
        <button 
          v-for="preset in workPresets" 
          :key="preset.minutes"
          @click="setTimer(preset.minutes * 60, 'work')"
          class="pixel-btn preset-btn"
          :class="{ 'active': selectedDuration === preset.minutes * 60 && sessionType === 'work' }"
        >
          {{ preset.minutes }}min
        </button>
      </div>

      <h3 class="pixel-text">Break Sessions</h3>
      <div class="preset-group">
        <button 
          v-for="preset in breakPresets" 
          :key="preset.minutes"
          @click="setTimer(preset.minutes * 60, 'break')"
          class="pixel-btn preset-btn break-btn"
          :class="{ 'active': selectedDuration === preset.minutes * 60 && sessionType === 'break' }"
        >
          {{ preset.minutes }}min
        </button>
      </div>
    </div>

    <!-- Timer Controls -->
    <div class="timer-controls">
      <button 
        v-if="!isActive" 
        @click="startTimer" 
        :disabled="!selectedDuration"
        class="pixel-btn control-btn start-btn"
      >
        🚀 Start
      </button>
      
      <template v-else>
        <button @click="pauseTimer" v-if="!isPaused" class="pixel-btn control-btn pause-btn">
          ⏸️ Pause
        </button>
        <button @click="resumeTimer" v-else class="pixel-btn control-btn resume-btn">
          ▶️ Resume
        </button>
        <button @click="stopTimer" class="pixel-btn control-btn stop-btn">
          🛑 Stop
        </button>
      </template>
      
      <button @click="resetTimer" class="pixel-btn control-btn reset-btn">
        🔄 Reset
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container" v-if="selectedDuration">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import { useTimer } from '../composables/useTimer'

export default {
  name: 'Timer',
  emits: ['session-complete', 'session-start', 'progress-update'],
  setup(props, { emit }) {
    const {
      timeRemaining,
      isActive,
      isPaused,
      sessionType,
      selectedDuration,
      sessionCount,
      startTimer: start,
      pauseTimer: pause,
      resumeTimer: resume,
      stopTimer: stop,
      resetTimer: reset,
      setTimer: setDuration
    } = useTimer()

    // Timer presets
    const workPresets = [
      { minutes: 25 },
      { minutes: 30 },
      { minutes: 45 }
    ]

    const breakPresets = [
      { minutes: 5 },
      { minutes: 10 },
      { minutes: 15 }
    ]

    // Computed properties
    const formattedTime = computed(() => {
      const minutes = Math.floor(timeRemaining.value / 60)
      const seconds = timeRemaining.value % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })

    const sessionTypeLabel = computed(() => {
      return sessionType.value === 'work' ? '💼 Work Time' : '☕ Break Time'
    })

    const progressPercentage = computed(() => {
      if (!selectedDuration.value) return 0
      return ((selectedDuration.value - timeRemaining.value) / selectedDuration.value) * 100
    })

    // Timer control methods
    const startTimer = () => {
      start()
      emit('session-start', sessionType.value)
    }

    const pauseTimer = () => {
      pause()
    }

    const resumeTimer = () => {
      resume()
    }

    const stopTimer = () => {
      const sessionData = {
        type: sessionType.value,
        duration: selectedDuration.value,
        completed: false,
        completedAt: new Date().toISOString()
      }
      stop()
      emit('session-complete', sessionData)
    }

    const resetTimer = () => {
      reset()
    }

    const setTimer = (duration, type) => {
      setDuration(duration, type)
    }

    // Watch for session completion
    const checkSessionCompletion = () => {
      if (timeRemaining.value === 0 && isActive.value) {
        const sessionData = {
          type: sessionType.value,
          duration: selectedDuration.value,
          completed: true,
          completedAt: new Date().toISOString()
        }
        emit('session-complete', sessionData)
        
        // Play completion sound (if enabled)
        playCompletionSound()
      }
    }

    const playCompletionSound = () => {
      // Simple water drop sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    // Set up interval to check for completion
    const completionInterval = setInterval(checkSessionCompletion, 1000)

    onUnmounted(() => {
      clearInterval(completionInterval)
    })

    return {
      timeRemaining,
      isActive,
      isPaused,
      sessionType,
      selectedDuration,
      sessionCount,
      workPresets,
      breakPresets,
      formattedTime,
      sessionTypeLabel,
      progressPercentage,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      resetTimer,
      setTimer
    }
  }
}
</script>
