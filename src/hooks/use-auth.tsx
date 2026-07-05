import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

type Role = 'patient' | 'professional'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  role: Role | null
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  acceptConsent: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        role: 'patient',
        name,
        points: 0,
        badges: { earnedBadges: [], readMaterials: [] },
        consent_accepted: false,
      })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error: any) {
      if (error?.status === 400 || error?.status === 401) {
        return {
          error: {
            status: 401,
            message: 'Credenciais inválidas. Por favor, tente novamente.',
          },
        }
      }
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const acceptConsent = async () => {
    if (!user?.id) return
    await pb.collection('users').update(user.id, {
      consent_accepted: true,
      consent_date: new Date().toISOString(),
    })
    await pb.collection('users').authRefresh()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        role: user?.role ?? null,
        signUp,
        signIn,
        signOut,
        acceptConsent,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
