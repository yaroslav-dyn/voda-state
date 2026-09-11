import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TSessionType } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const defaultWorkDuration = ref<number | null>(null)
  const defaultBreakDuration = ref<number | null>(null)
  const isStartBreakAuto = ref<boolean>(false)
  const isStartWorkAuto = ref<boolean>(false)

  const setDefaultTimerParams = (duration: number, type: TSessionType): void => {
    switch (type) {
      case 'work':
        defaultWorkDuration.value = duration
        break
      case 'break':
        defaultBreakDuration.value = duration
        break
      default:
        console.warn('Unknown session type:', type)
    }
  }

  function changeStartBreakAuto(event: Event): void {
    const target = event.target as HTMLInputElement
    isStartBreakAuto.value = target.checked
  }

  function changeStartWorkAuto(event: Event): void {
    const target = event.target as HTMLInputElement
    isStartWorkAuto.value = target.checked
  }

  return {
    defaultWorkDuration,
    defaultBreakDuration,
    setDefaultTimerParams,
    isStartBreakAuto,
    isStartWorkAuto,
    changeStartBreakAuto,
    changeStartWorkAuto
  }
}, { persist: true })