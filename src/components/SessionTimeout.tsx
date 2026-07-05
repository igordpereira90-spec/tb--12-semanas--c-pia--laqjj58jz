import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const TIMEOUT_MS = 30 * 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll']

interface Props {
  onTimeout: () => void
}

export function SessionTimeout({ onTimeout }: Props) {
  const navigate = useNavigate()
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        onTimeoutRef.current()
        navigate('/login?expired=true', { replace: true })
      }, TIMEOUT_MS)
    }

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timer)
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, reset))
    }
  }, [navigate])

  return null
}
