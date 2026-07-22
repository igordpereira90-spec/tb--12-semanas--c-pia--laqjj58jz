import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useUnlocks } from '@/hooks/use-unlocks'
import { getQuestionnaires } from '@/services/questionnaires'
import { QuestionnaireForm } from '@/components/patient/QuestionnaireForm'
import { CelebrationModal } from '@/components/patient/CelebrationModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ClipboardList, Lock, Loader2 } from 'lucide-react'
import { isQuestionnaireAccessible } from '@/lib/patient-utils'
import { QUESTIONNAIRE_WEEKS, ALL_WEEKS } from '@/lib/questionnaire-config'
import { refreshAuthUser } from '@/services/gamification'
import { calculateQuestionnairePoints, type PointCalculation } from '@/lib/scoring'
import type { Questionnaire } from '@/services/questionnaires'

export default function QuestionnaireFormPage() {
  const { week } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { unlockedWeeks, loading: unlocksLoading } = useUnlocks(user?.id)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loadingQs, setLoadingQs] = useState(true)
  const [celebration, setCelebration] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState<PointCalculation | null>(null)
  const weekNumber = Number(week) || 0

  useEffect(() => {
    if (!user?.id) {
      setLoadingQs(false)
      return
    }
    getQuestionnaires(user.id)
      .then((qs) => setQuestionnaires(qs))
      .catch(() => {})
      .finally(() => setLoadingQs(false))
  }, [user?.id])

  const handleSubmit = async (_data: Record<string, unknown>) => {
    if (!user?.id) return
    try {
      await refreshAuthUser()
      const prevWeeks = questionnaires
        .filter((q) => q.week_number !== weekNumber)
        .map((q) => q.week_number)
      const calc = calculateQuestionnairePoints(weekNumber, prevWeeks)
      setEarnedPoints(calc)
      setCelebration(true)
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível finalizar o questionário.' })
    }
  }

  const existingDraft = questionnaires.find((q) => q.week_number === weekNumber)
  const completedWeeks = questionnaires.map((q) => q.week_number)
  const hasAccess = isQuestionnaireAccessible(
    weekNumber,
    completedWeeks,
    unlockedWeeks,
    QUESTIONNAIRE_WEEKS,
    ALL_WEEKS,
  )

  if (unlocksLoading || loadingQs) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-700">Conteúdo Bloqueado</h2>
        <p className="text-slate-500">
          Você ainda não tem acesso ao questionário da Semana {weekNumber}. Aguarde a liberação do
          seu profissional ou complete as semanas anteriores.
        </p>
        <Button variant="outline" onClick={() => navigate('/patient')}>
          Voltar para o início
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/patient/questionnaires')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Questionário — Semana {weekNumber}
            </h1>
            <p className="text-slate-600 text-sm">
              Responda com sinceridade. Suas respostas ajudam no seu tratamento.
            </p>
          </div>
        </div>
      </div>
      <QuestionnaireForm
        week={weekNumber}
        onSubmit={handleSubmit}
        initialData={existingDraft}
        recordId={existingDraft?.id ?? null}
      />
      <CelebrationModal
        open={celebration}
        onClose={() => {
          setCelebration(false)
          refreshAuthUser()
          navigate('/patient')
        }}
        points={earnedPoints?.total}
        basePoints={earnedPoints?.base}
        streakBonus={earnedPoints?.streak}
        message="Parabéns! Você está cuidando da sua saúde."
      />
    </div>
  )
}
