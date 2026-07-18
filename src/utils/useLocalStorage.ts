import { useEffect, useState } from 'react'

// A useState that persists its value to localStorage under `key`.
// Falls back to `initial` when nothing is stored or storage is unavailable.
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write failures (e.g. private mode / quota).
    }
  }, [key, value])

  return [value, setValue] as const
}
