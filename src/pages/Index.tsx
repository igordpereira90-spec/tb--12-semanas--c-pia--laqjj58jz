import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function Index() {
  const { role } = useAuth()
  return <Navigate to={role === 'professional' ? '/pro' : '/patient'} replace />
}
