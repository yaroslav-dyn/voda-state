// import { ref, computed } from 'vue'
// import type { TSessionType } from '@/types'

// export function useTimer() {
//   const timeRemaining = ref<number>(0)
//   const selectedDuration = ref<number>(0)
//   const isActive = ref<boolean>(false)
//   const isPaused = ref<boolean>(false)
//   const sessionType = ref<TSessionType>('work')
//   const sessionCount = ref<number>(0)

//   let timerInterval: ReturnType<typeof setInterval> | null = null
//   const startTimestamp = ref<number | null>(null)
//   const endTimestamp = ref<number | null>(null)

//   const updateTimeRemaining = (): void => {
//     const now = Date.now()
//     const diff = Math.round((endTimestamp.value! - now) / 1000)
//     timeRemaining.value = diff > 0 ? diff : 0
//     if (timeRemaining.value === 0) {
//       stopTimer()
//     }
//   }

//   const startTimer = (): void => {
//     if (timeRemaining.value === selectedDuration.value) {
//       sessionCount.value += 1
//     } else if (timeRemaining.value === 0) {
//       sessionCount.value += 1
//       timeRemaining.value = selectedDuration.value
//     }
//     isActive.value = true
//     isPaused.value = false

//     startTimestamp.value = Date.now()
//     endTimestamp.value = startTimestamp.value + timeRemaining.value * 1000

//     updateTimeRemaining()

//     timerInterval = setInterval(() => {
//       updateTimeRemaining()
//     }, 1000)
//   }

//   const pauseTimer = (): void => {
//     isPaused.value = true
//     if (timerInterval) {
//       clearInterval(timerInterval)
//       timerInterval = null
//     }
//     updateTimeRemaining()
//   }

//   const resumeTimer = (): void => {
//     isPaused.value = false
//     startTimestamp.value = Date.now()
//     endTimestamp.value = startTimestamp.value + timeRemaining.value * 1000

//     timerInterval = setInterval(() => {
//       updateTimeRemaining()
//     }, 1000)
//   }

//   const stopTimer = (): void => {
//     isActive.value = false
//     isPaused.value = false

//     if (timerInterval) {
//       clearInterval(timerInterval)
//       timerInterval = null
//     }
//     startTimestamp.value = null
//     endTimestamp.value = null
//   }

//   const resetTimer = (): void => {
//     stopTimer()
//     timeRemaining.value = 0
//     sessionCount.value = 0
//   }

//   const setTimer = (duration: number, type: TSessionType = 'work'): void => {
//     if (!isActive.value) {
//       selectedDuration.value = duration
//       timeRemaining.value = duration
//       sessionType.value = type
//     }
//   }

//   const setDefaultTimers = (workDuration: number, breakDuration: number): void => {
//     switch (sessionType.value) {
//       case 'work':
//         selectedDuration.value = workDuration
//         break
//       case 'break':
//         selectedDuration.value = breakDuration
//         break
//       default:
//         return
//     }
//   }

//   const progress = computed((): number => {
//     if (selectedDuration.value === 0) return 0
//     return ((selectedDuration.value - timeRemaining.value) / selectedDuration.value) * 100
//   })

//   return {
//     timeRemaining,
//     selectedDuration,
//     isActive,
//     isPaused,
//     sessionType,
//     sessionCount,
//     progress,
//     startTimer,
//     pauseTimer,
//     resumeTimer,
//     stopTimer,
//     resetTimer,
//     setTimer,
//     setDefaultTimers,
//     startTimestamp,
//     endTimestamp
//   }
// }