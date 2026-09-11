import type { TTimerWorkerCommand, ITimerWorkerResponse } from '@/types'

let timerId: ReturnType<typeof setInterval> | null = null
let remainingTime = 0
let isPaused = true

self.onmessage = function (e: MessageEvent<TTimerWorkerCommand>) {
  const data = e.data
  const command = data.command

  switch (command) {
    case 'start': {
      const duration = (data as TTimerWorkerCommand & { command: 'start'; duration: number }).duration
      if (typeof duration === 'number') {
        remainingTime = duration
      }
      if (timerId) {
        clearInterval(timerId)
      }
      isPaused = false
      timerId = setInterval(() => {
        if (!isPaused) {
          remainingTime--
          const response: ITimerWorkerResponse = { remainingTime }
          self.postMessage(response)
          if (remainingTime <= 0) {
            clearInterval(timerId!)
            timerId = null
            self.postMessage({ done: true })
          }
        }
      }, 1000)
      break
    }

    case 'pause':
      isPaused = true
      break

    case 'resume':
      if (timerId) {
        isPaused = false
      }
      break

    case 'stop':
      if (timerId) {
        clearInterval(timerId)
        timerId = null
      }
      remainingTime = 0
      isPaused = true
      self.postMessage({ remainingTime })
      break

    case 'reset':
      if (timerId) {
        clearInterval(timerId)
        timerId = null
      }
      remainingTime = 0
      isPaused = true
      self.postMessage({ remainingTime })
      break

    default:
      break
  }
}