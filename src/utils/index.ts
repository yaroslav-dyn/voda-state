import type { IPreset, ITimePresets } from '@/types'

export const workPresets: IPreset[] = [
  { minutes: 1 },
  { minutes: 5 },
  { minutes: 25 },
  { minutes: 30 },
  { minutes: 45 },
  { minutes: 60 }
]

export const breakPresets: IPreset[] = [
  { minutes: 1 },
  { minutes: 5 },
  { minutes: 10 },
  { minutes: 15 },
  { minutes: 30 }
]

export const getTimePresets = (): ITimePresets => {
  const prodWorkPresets = workPresets.filter((p) => p.minutes !== 1 && p.minutes !== 5)
  const prodBreakPresets = breakPresets.filter((p) => p.minutes !== 1)
  return {
    work: import.meta.env.DEV ? workPresets : prodWorkPresets,
    break: import.meta.env.DEV ? breakPresets : prodBreakPresets
  }
}

export const playCompletionSound = (): void => {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(
    400,
    audioContext.currentTime + 0.3
  )

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.3
  )

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function keysToSnakeCase(obj: unknown): unknown {
  if (obj === undefined) return undefined
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnakeCase(v))
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
      acc[camelToSnake(key)] = keysToSnakeCase((obj as Record<string, unknown>)[key])
      return acc
    }, {} as Record<string, unknown>)
  }
  return obj
}

export { keysToSnakeCase }