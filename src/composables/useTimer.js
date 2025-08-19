import { ref, computed, onMounted, watch } from 'vue'
import { useSupabase } from "../composables/useSupabase";

export function useTimer() {
  const { user } = useSupabase();

  const timeRemaining = ref(0)
  const selectedDuration = ref(0)
  const isActive = ref(false)
  const isPaused = ref(false)
  const sessionType = ref('work')
  const sessionCount = ref(0)
  
  let timerInterval = null

  onMounted(()=> {
    // setSavedSession();
    console.log('useTimer onMounted');
    
  })

  watch(sessionCount, (val) => {
    saveSession(val)
  })

  const setSavedSession = () => {
    const storageSesionItem = localStorage.getItem(`vs_session_${user.value.id}`)
    if (!storageSesionItem) return

    const savedSession = JSON.parse(storageSesionItem);
    // timeRemaining.value = savedSession?.timeRemaining
    // isActive.value = savedSession?.isActive
    // isPaused.value = savedSession?.isPaused
    // sessionType.value = savedSession?.sessionType 
    // selectedDuration.value = savedSession?.selectedDuration
    sessionCount.value = savedSession?.sessionCount
    // savedSession?.isActive && (startTimer())
  }

  const saveSession = (sessionCount) => {

    const savedSessionObject = JSON.stringify({
      // timeRemaining: timeRemaining.value,
      // isActive: isActive.value,
      // isPaused: isPaused.value,
      // sessionType: sessionType.value,
      // selectedDuration: selectedDuration.value,
      sessionCount: sessionCount
    });
    localStorage.setItem(`vs_session_${user?.value?.id}`, savedSessionObject);
};

  const deleteLocalSection = () =>
    localStorage.removeItem(`vs_session_${user?.value?.id}`)

  const startTimer = () => {
    console.log("🚀 ~ startTimer ~ timeRemaining.value:", timeRemaining.value, selectedDuration.value)
    if (timeRemaining.value === selectedDuration.value) {
      sessionCount.value += 1
    } else if (timeRemaining.value === 0) {
        sessionCount.value += 1
      timeRemaining.value = selectedDuration.value
    } 
    isActive.value = true
    isPaused.value = false

    // saveSession();
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
    deleteLocalSection()
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
