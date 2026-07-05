import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, ShieldAlert } from 'lucide-react'

export function ProtectedRoute({ role }: { role?: 'patient' | 'professional' }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const currentPath = window.location.pathname
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />
  }

  if (role && user?.role !== role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <ShieldAlert className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-semibold text-slate-800">Acesso não autorizado</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Você não tem permissão para acessar esta área. Redirecionando para o seu painel...
        </p>
        <Navigate to={user?.role === 'professional' ? '/pro' : '/'} replace />
      </div>
    )
  }

  return <Outlet />
}
