import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getUnlockedWeeks } from '@/services/patient_unlocks'

export function useUnlocks(patientId?: string) {
  const [unlockedWeeks, setUnlockedWeeks] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!patientId) {
      setLoading(false)
      return
    }
    try {
      const weeks = await getUnlockedWeeks(patientId)
      setUnlockedWeeks(weeks)
    } catch {
      setUnlockedWeeks([])
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('patient_unlocks', () => {
    loadData()
  })

  return { unlockedWeeks, loading }
}
