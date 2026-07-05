import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Activity,
  LogOut,
  Home,
  ShieldCheck,
  UserCircle,
  Gift,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NotificationsBell } from '@/components/NotificationsBell'
import { UserAvatar } from '@/components/UserAvatar'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/medpsi-receituario-igor-cabecalho-2952f.jpg'

export default function Layout() {
  const { user, role, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [, setForceUpdate] = useState(0)

  useEffect(() => {
    const refreshUser = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh()
        } catch {
          pb.authStore.clear()
        }
      }
      setForceUpdate((n) => n + 1)
    }
    refreshUser()
  }, [])

  useRealtime('users', () => {
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => {})
      setForceUpdate((n) => n + 1)
    }
  })

  const patientNav = [
    { path: '/patient', label: 'Início', icon: Home },
    { path: '/patient/library', label: 'Biblioteca', icon: BookOpen },
    { path: '/patient/questionnaires', label: 'Meu Progresso', icon: Activity },
    { path: '/bonus', label: 'Bônus', icon: Gift },
    { path: '/profile', label: 'Perfil', icon: UserCircle },
  ]
  const proNav = [
    { path: '/pro', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pro/questionnaire-settings', label: 'Questionário', icon: ClipboardList },
    { path: '/pro/materials', label: 'Material Educativo', icon: BookOpen },
    { path: '/pro/audit', label: 'Auditoria', icon: ShieldCheck },
    { path: '/bonus', label: 'Bônus', icon: Gift },
    { path: '/profile', label: 'Perfil', icon: UserCircle },
  ]
  const navItems = role === 'professional' ? proNav : patientNav

  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }
  const homePath = role === 'professional' ? '/pro' : '/'

  return (
    <div className="min-h-screen flex bg-[#FBFAF7]">
      <aside className="hidden md:flex flex-col w-64 border-r border-[#D4AF37]/15 bg-white shadow-sm rounded-none">
        <div className="p-6">
          <Link to={homePath} className="block">
            <img
              src={logoUrl}
              alt="Dr. Igor Dourado Pereira"
              className="w-full object-contain mix-blend-multiply transition-transform duration-200 hover:scale-[1.03]"
            />
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path) &&
                item.path !== '/patient' &&
                item.path !== '/pro')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white shadow-md shadow-[#D4AF37]/20'
                    : 'text-slate-600 hover:bg-[#D4AF37]/5 hover:text-[#B8941F]',
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-white')} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}{' '}
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <UserAvatar user={user} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {role === 'professional' ? 'Profissional' : 'Paciente'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-500 hover:text-rose-600"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 bg-[#FBFAF7]/50">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-[#D4AF37]/15 sticky top-0 z-20 shadow-sm">
          <Link
            to={homePath}
            className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
          ></Link>
          <div className="hidden md:flex items-center text-sm font-medium text-slate-500">
            {role === 'patient' ? 'Área do Paciente' : 'Área do Profissional'}
          </div>
          <div className="flex items-center space-x-4">
            {role === 'patient' && (
              <div className="hidden md:flex items-center gap-1 bg-[#D4AF37]/10 text-[#B8941F] px-3 py-1.5 rounded-full text-sm font-bold">
                ⭐ {user?.points ?? 0} XP
            </div>
          )}
          <NotificationsBell />
          <Link
            to="/profile"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-[#D4AF37]/5 hover:text-[#B8941F] transition-colors"
          >
            <UserCircle className="w-5 h-5 text-slate-600" />
            <span>Perfil</span>
          </Link>
          <UserAvatar user={user} size="sm" className="md:hidden" showRing={false} />
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in-up">
        <div className="max-w-6xl mx-auto space-y-6">
          <Outlet />
        </div>
      </div>
    </main>
=======
              ⭐ {user?.points ?? 0} XP
            </div>
          )}
          <NotificationsBell />
          <Link
            to="/profile"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-[#D4AF37]/5 hover:text-[#B8941F] transition-colors"
          >
            <UserCircle className="w-5 h-5 text-slate-600" />
            <span>Perfil</span>
          </Link>
          <UserAvatar user={user} size="sm" className="md:hidden" showRing={false} />
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in-up">
        <div className="max-w-6xl mx-auto space-y-6">
          <Outlet />
        </div>
      </div>
    </main>
              </div>
            )}
            <NotificationsBell />
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <UserCircle className="w-5 h-5 text-slate-600" />
              <span>Perfil</span>
            </Link>
            <UserAvatar user={user} size="sm" className="md:hidden" showRing={false} />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in-up">
          <div className="max-w-6xl mx-auto space-y-6">
            <Outlet />
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around p-3 z-30">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 w-16 transition-colors',
                isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600',
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'fill-primary/20')} />
              <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center space-y-1 w-16 text-slate-400"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </nav>
    </div>
  )
}
