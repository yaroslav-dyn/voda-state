import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { storeToRefs } from 'pinia';

export function useTimer() {
  const userStore = useUserStore()
  const { user, ghostUser } = storeToRefs(userStore);

  const timeRemaining = ref(0)
  const selectedDuration = ref(0)
  const isActive = ref(false)
  const isPaused = ref(false)
  const sessionType = ref('work')
  const sessionCount = ref(0)
  
  let timerInterval = null

  const startTimer = () => {
    if (timeRemaining.value === selectedDuration.value) {
      sessionCount.value += 1
    } else if (timeRemaining.value === 0) {
        sessionCount.value += 1
      timeRemaining.value = selectedDuration.value
    } 
    isActive.value = true
    isPaused.value = false

      timerInterval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value -= 1
      } else {
        stopTimer()
      }
    }, 1000)
  }

  const pauseTimer = () => {
    isPaused.value = true
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const resumeTimer = () => {
    isPaused.value = false
    
    timerInterval = setInterval(() => {
      if (timeRemaining.value > 0) {
        timeRemaining.value -= 1
      } else {
        stopTimer()
      }
    }, 1000)
  }

  const stopTimer = () => {
    isActive.value = false
    isPaused.value = false
  
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
      // sessionCount.value && sessionCount.value--
    } else {
    }
  }

  const resetTimer = () => {
    stopTimer()
    timeRemaining.value = 0
    sessionCount.value = 0
    // deleteLocalSection()
  }

  const setTimer = (duration, type = 'work') => {
    if (!isActive.value) {
      selectedDuration.value = duration
      timeRemaining.value = duration
      sessionType.value = type
    }
  }


  // Computed properties
  const progress = computed(() => {
    if (selectedDuration.value === 0) return 0
    return ((selectedDuration.value - timeRemaining.value) / selectedDuration.value) * 100
  })

  return {
    timeRemaining,
    selectedDuration,
    isActive,
    isPaused,
    sessionType,
    sessionCount,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setTimer
  }
}
