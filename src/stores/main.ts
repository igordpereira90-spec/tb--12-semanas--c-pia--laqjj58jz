import { useState, useEffect } from 'react'

type AppRole = 'patient' | 'professional'

let globalRole: AppRole = 'patient'
const listeners = new Set<() => void>()

export default function useAppStore() {
  const [role, setRoleState] = useState<AppRole>(globalRole)

  useEffect(() => {
    const listener = () => setRoleState(globalRole)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const setRole = (newRole: AppRole) => {
    globalRole = newRole
    listeners.forEach((l) => l())
  }

  return { role, setRole }
}
