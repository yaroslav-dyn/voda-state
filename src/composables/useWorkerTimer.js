import { ref, computed } from 'vue'

const timerWorker = new Worker(
  new URL('../workers/timerWorker.js', import.meta.url), { type: 'module' }
);

export function useWorkerTimer() {

  const timeRemaining = ref(0)
  const selectedDuration = ref(0)
  const isActive = ref(false)
  const isPaused = ref(false)
  const sessionType = ref('work')
  const sessionCount = ref(0)
  const startTimestamp = ref(null)
  const endTimestamp = ref(null)

  timerWorker.onmessage = (event) => {
    const data = event.data;
    if (data.remainingTime !== undefined) {
      timeRemaining.value = data.remainingTime
    }
    if (data.done) {
      // setTimeout(() => stopTimer(), 1000)
      stopTimer()
    }
  };

  const startTimer = () => {
    if (timeRemaining.value === selectedDuration.value) {
      sessionCount.value += 1
    } else if (timeRemaining.value === 0) {
      sessionCount.value += 1
      timeRemaining.value = selectedDuration.value
    }
    isActive.value = true
    isPaused.value = false

    startTimestamp.value = Date.now()
    endTimestamp.value = startTimestamp.value + timeRemaining.value * 1000

    timerWorker.postMessage({ command: 'start', duration: selectedDuration.value })
  }


  const pauseTimer = () => {
    isPaused.value = true
    timerWorker.postMessage({ command: 'pause' });
  }

  const resumeTimer = () => {
    isPaused.value = false
    timerWorker.postMessage({ command: 'resume' })
  }

  const stopTimer = () => {
    isActive.value = false
    isPaused.value = false

    timerWorker.postMessage({ command: 'stop' });
    startTimestamp.value = null
    endTimestamp.value = null
  }

  const resetTimer = () => {
    stopTimer()
    timeRemaining.value = 0
    sessionCount.value = 0
  }

  const setTimer = (duration, type = 'work') => {
    if (!isActive.value) {
      selectedDuration.value = duration
      timeRemaining.value = duration
      sessionType.value = type
    }
  }

  const setDefaultTimers = (workDuration, breakDuration) => {
    switch (sessionType.value) {
      case 'work':
        selectedDuration.value = workDuration.value
        break
      case 'break':
        selectedDuration.value = breakDuration.value
        break
      default:
        return undefined
    }
  }

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
    setTimer,
    setDefaultTimers,
    startTimestamp,
    endTimestamp
  }

}