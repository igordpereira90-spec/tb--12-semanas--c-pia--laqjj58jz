import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getQuestionnaires } from '@/services/questionnaires'
import { getEducationalMaterials } from '@/services/educational_materials'
import { getQuestionnaireConfigs } from '@/services/questionnaire_configs'
import { parseUserBadges } from '@/services/gamification'
import { useMaterialCompletions } from '@/hooks/use-material-completions'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Unlock, Loader2 } from 'lucide-react'
import { Timeline } from '@/components/patient/Timeline'
import { CurrentTaskCard } from '@/components/patient/CurrentTaskCard'
import { BadgesGallery } from '@/components/patient/BadgesGallery'
import { useUnlocks } from '@/hooks/use-unlocks'
import { getCurrentWeek, getProgress, getProgramWeek } from '@/lib/patient-utils'
import { MAX_XP, getXPProgress } from '@/lib/scoring'
import type { Questionnaire } from '@/services/questionnaires'
import type { EducationalMaterial } from '@/services/educational_materials'
import type { QuestionnaireConfig } from '@/services/questionnaire_configs'

export default function PatientHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [configs, setConfigs] = useState<QuestionnaireConfig[]>([])
  const [loading, setLoading] = useState(true)
  const { unlockedWeeks } = useUnlocks(user?.id)
  const { completedMaterialIds } = useMaterialCompletions(user?.id)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    try {
      const [qs, mats, cfgs] = await Promise.all([
        getQuestionnaires(user.id),
        getEducationalMaterials(),
        getQuestionnaireConfigs(),
      ])
      setQuestionnaires(qs)
      setMaterials(mats)
      setConfigs(cfgs)
    } catch {
      setQuestionnaires([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('questionnaires', () => {
    loadData()
  })
  useRealtime('educational_materials', () => {
    loadData()
  })
  useRealtime('questionnaire_configs', () => {
    loadData()
  })

  const questionnaireConfigWeeks = useMemo(() => configs.map((c) => c.week_number), [configs])

  const consultationWeeks = useMemo(() => {
    const fromConfigs = configs
      .filter((c) => {
        const cfg = c.configs as Record<string, unknown>
        return cfg?.has_consultation === true
      })
      .map((c) => c.week_number)
    return fromConfigs
  }, [configs])

  const handleActivityClick = useCallback(
    (week: number, type: 'material' | 'questionnaire' | 'consultation') => {
      if (type === 'questionnaire') {
        navigate(`/patient/questionnaires/${week}`)
      } else if (type === 'material') {
        navigate('/patient/library')
      }
    },
    [navigate],
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const userBadges = parseUserBadges(user?.badges)
  const points = user?.points ?? 0
  const currentWeek = getCurrentWeek(questionnaires)
  const progress = getProgress(questionnaires)
  const xpProgress = getXPProgress(points)
  const completedWeeks = questionnaires.map((q) => q.week_number)
  const programWeek = getProgramWeek(questionnaires)

  const hasQuestionnairePending = !completedWeeks.includes(currentWeek)
  const nextUnreadMaterial = materials.find(
    (m) =>
      (m.week_number <= programWeek || unlockedWeeks.includes(m.week_number)) &&
      !completedMaterialIds.has(m.id),
  )
  const hasMaterialToRead = !hasQuestionnairePending && !!nextUnreadMaterial

  const handleAction = () => {
    if (hasQuestionnairePending) {
      navigate(`/patient/questionnaires/${currentWeek}`)
    } else {
      navigate('/patient/library')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Olá, {user?.name?.split(' ')[0] || 'paciente'}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bem-vindo de volta ao Programa de Acompanhamento em Depressão
          </p>
        </div>
      </div>
      <CurrentTaskCard
        weekNumber={currentWeek}
        hasQuestionnairePending={hasQuestionnairePending}
        hasMaterialToRead={hasMaterialToRead}
        points={points}
        maxXp={MAX_XP}
        onAction={handleAction}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Sua Jornada</h2>
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            ⭐ {points} / {MAX_XP} XP
          </span>
        </div>
        <Card className="p-2 md:p-6 shadow-sm border-slate-100">
          <Timeline
            completedWeeks={completedWeeks}
            unlockedWeeks={unlockedWeeks}
            materialWeeks={materials.map((m) => m.week_number)}
            completedMaterialWeeks={materials
              .filter((m) => completedMaterialIds.has(m.id))
              .map((m) => m.week_number)}
            questionnaireConfigWeeks={questionnaireConfigWeeks}
            consultationWeeks={consultationWeeks}
            onActivityClick={handleActivityClick}
          />
          <div className="mt-8 px-4 pb-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Progresso XP</span>
              <span>
                ⭐ {points} / {MAX_XP} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-3 bg-slate-100" />
          </div>
        </Card>
        {unlockedWeeks.length > 0 && (
          <Card className="p-4 bg-indigo-50/50 border-indigo-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Unlock className="w-4 h-4" />
            </div>
            <p className="text-sm text-indigo-700">
              Seu profissional liberou {unlockedWeeks.length}{' '}
              {unlockedWeeks.length > 1 ? 'semanas adicionais' : 'semana adicional'} para acesso
              antecipado.
            </p>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">🏆 Suas Conquistas</h2>
        <BadgesGallery earnedBadges={userBadges.earnedBadges} />
      </section>
    </div>
  )
}
