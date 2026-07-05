import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { validatePassword } from '@/lib/password-validation'
import { logAction } from '@/services/audit_logs'
import { ArrowRight, CheckCircle2, XCircle, ShieldAlert, Lock } from 'lucide-react'
import logoImg from '@/assets/medpsi-receituario-igor-cabecalho-2952f.jpg'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('expired') === 'true'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [pwValidation, setPwValidation] = useState(validatePassword(''))

  const redirectToDashboard = () => {
    const record = pb.authStore.record as { role?: string } | null
    if (record?.role === 'professional') {
      navigate('/pro', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      const errMsg =
        error?.status === 401
          ? 'Credenciais inválidas. Por favor, tente novamente.'
          : getErrorMessage(error)
      setError(errMsg)
      return
    }
    logAction('LOGIN').catch(() => {})
    redirectToDashboard()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pwValidation.valid) {
      setError('A senha não atende aos requisitos de complexidade.')
      return
    }
    const { error } = await signUp(email, password, name || '')
    if (error) {
      const errMsg =
        error?.status === 401
          ? 'Credenciais inválidas. Por favor, tente novamente.'
          : getErrorMessage(error)
      setError(errMsg)
      return
    }
    logAction('LOGIN').catch(() => {})
    redirectToDashboard()
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    setPwValidation(validatePassword(val))
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="hidden md:flex md:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#B8941F] via-[#C5A028] to-[#D4AF37]" />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-yellow-200/20 blur-2xl" />

        <div className="relative z-10 text-white max-w-md">
          <div className="flex justify-center mb-8">
            <img
              src={logoImg}
              alt="Logotipo do Programa de Acompanhamento"
              className="w-full max-w-xs h-auto rounded-2xl object-contain shadow-2xl"
            />
          </div>

          <h1 className="font-serif text-4xl font-bold leading-tight mb-4">
            Programa&nbsp;<span>de</span>
            <div>
              Acompanhamento
              <br />
              <span className="block text-2xl font-normal text-amber-100/90 mt-1">12 Semanas</span>
            </div>
          </h1>

          <p className="text-amber-50/80 text-lg leading-relaxed mb-12">
            Um acompanhamento clínico de excelência para apoiar sua jornada de equilíbrio e
            bem-estar.
          </p>

          <div className="space-y-3">
            {[
              'Questionários estruturados quinzenais',
              'Acompanhamento clínico profissional',
              'Conteúdo psicoeducativo exclusivo',
              'Sistema de conquistas e motivação',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-amber-50/90">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-[0_20px_60px_-15px_rgba(180,148,31,0.15)] border-amber-100/50 bg-white">
          <div className="md:hidden flex flex-col items-center mb-6">
            <img
              src={logoImg}
              alt="Logotipo do Programa de Acompanhamento"
              className="w-full max-w-[180px] h-auto rounded-xl object-contain"
            />
          </div>

          <div className="hidden md:block mb-6">
            <h2 className="font-serif text-2xl font-bold text-slate-800">Bem-vindo</h2>
            <p className="text-sm text-slate-500 mt-1">Acesse sua conta para continuar</p>
          </div>

          {sessionExpired && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <ShieldAlert className="h-4 w-4 !text-amber-600" />
              <AlertDescription className="text-amber-700 text-sm">
                Sua sessão expirou por inatividade. Faça login novamente para continuar.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-rose-50 border-rose-200">
              <XCircle className="h-4 w-4 !text-rose-500" />
              <AlertDescription className="text-rose-700 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-amber-50/50">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-800 data-[state=active]:shadow-sm"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-white data-[state=active]:text-amber-800 data-[state=active]:shadow-sm"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-700 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-pass" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="login-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C5A028] to-[#D4AF37] hover:from-[#B8941F] hover:to-[#C5A028] text-white shadow-lg shadow-amber-500/20"
                  size="lg"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Entrar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Use seu e-mail e senha cadastrados para acessar o programa.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name" className="text-slate-700 font-medium">
                    Nome
                  </Label>
                  <Input
                    id="su-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email" className="text-slate-700 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="su-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pass" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="su-pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="border-amber-100 focus:border-amber-400 focus:ring-amber-400/20"
                  />
                  {password.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {pwValidation.checks.map((check) => (
                        <div key={check.label} className="flex items-center gap-1.5 text-xs">
                          {check.passed ? (
                            <CheckCircle2 className="w-3 h-3 text-amber-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-300" />
                          )}
                          <span className={check.passed ? 'text-amber-700' : 'text-slate-400'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C5A028] to-[#D4AF37] hover:from-[#B8941F] hover:to-[#C5A028] text-white shadow-lg shadow-amber-500/20"
                  size="lg"
                  disabled={password.length > 0 && !pwValidation.valid}
                >
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
