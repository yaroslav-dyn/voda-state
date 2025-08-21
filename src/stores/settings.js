import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {

  const defaultWorkDuration = ref(25)
  const defaultBreakDuration = ref(5)
  const isStartBreakAuto = ref(false)
  const isStartWorkAuto = ref(false)

  const setDefaultTimerParams = (duration, type) => {
    switch (type) {
      case 'work':
        defaultWorkDuration.value = duration;
        break;
      case 'break':
        defaultBreakDuration.value = duration;
        break;
      default:
        console.warn('Unknown session type:', type);
    }
  }

  function changeStartBreakAuto(e) {
    isStartBreakAuto.value = e.target.checked
  }
  function changeStartWorkAuto(e) {
    isStartWorkAuto.value = e.target.checked
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

}, { persist: true })//