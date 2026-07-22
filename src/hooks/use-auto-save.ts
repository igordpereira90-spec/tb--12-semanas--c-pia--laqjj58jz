import { useState, useEffect, useRef, useCallback } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveOptions {
  saveFn: (data: Record<string, unknown>) => Promise<void>
  debounceMs?: number
  enabled?: boolean
}

export function useAutoSave(
  data: Record<string, unknown>,
  { saveFn, debounceMs = 2000, enabled = true }: AutoSaveOptions,
) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const dataRef = useRef(data)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>(JSON.stringify(data))
  const pendingRef = useRef(false)
  const savingRef = useRef(false)

  const performSave = useCallback(
    async (dataToSave: Record<string, unknown>): Promise<boolean> => {
      const serialized = JSON.stringify(dataToSave)
      if (serialized === lastSavedRef.current || savingRef.current) return true
      if (!enabled) return true

      savingRef.current = true
      setStatus('saving')
      try {
        await saveFn(dataToSave)
        lastSavedRef.current = serialized
        setStatus('saved')
        pendingRef.current = false
        setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 3000)
        return true
      } catch {
        setStatus('error')
        pendingRef.current = true
        return false
      } finally {
        savingRef.current = false
      }
    },
    [saveFn, enabled],
  )

  useEffect(() => {
    dataRef.current = data
    if (!enabled) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      performSave(dataRef.current)
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, enabled, debounceMs, performSave])

  useEffect(() => {
    const handleOnline = () => {
      if (pendingRef.current) performSave(dataRef.current)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', () => {})
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [performSave])

  const flush = useCallback(
    async (overrideData?: Record<string, unknown>): Promise<boolean> => {
      if (timerRef.current) clearTimeout(timerRef.current)
      const dataToSave = overrideData ?? dataRef.current
      return performSave(dataToSave)
    },
    [performSave],
  )

  return { status, flush }
}
