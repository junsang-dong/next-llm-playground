import { useCallback, useRef, useState } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const initialRef = useRef(initialValue)

  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return initialRef.current
      return JSON.parse(raw) as T
    } catch {
      return initialRef.current
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          /* quota or private mode */
        }
        return next
      })
    },
    [key],
  )

  return [stored, setValue]
}
