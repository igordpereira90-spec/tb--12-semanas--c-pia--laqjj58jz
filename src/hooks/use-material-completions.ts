import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getCompletedMaterialIds } from '@/services/material_completions'

export function useMaterialCompletions(patientId?: string) {
  const [completedMaterialIds, setCompletedMaterialIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!patientId) {
      setLoading(false)
      return
    }
    try {
      const ids = await getCompletedMaterialIds(patientId)
      setCompletedMaterialIds(ids)
    } catch {
      setCompletedMaterialIds(new Set())
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('material_completions', () => {
    loadData()
  })

  return { completedMaterialIds, loading }
}
