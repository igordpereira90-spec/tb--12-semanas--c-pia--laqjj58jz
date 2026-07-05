import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getQuestionnaires } from '@/services/questionnaires'
import { getEducationalMaterials } from '@/services/educational_materials'
import { getQuestionnaireConfigs } from '@/services/questionnaire_configs'
import { parseUserBadges } from '@/services/gamification'
import { useMaterialCompletions } from '@/hooks/use-material-completions'
import { useUnlocks } from '@/hooks/use-unlocks'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Activity, Award, TrendingUp } from 'lucide-react'
import { Roadmap } from '@/components/patient/Roadmap'
import { getCurrentWeek, getProgress } from '@/lib/patient-utils'
import { MAX_XP, getXPProgress } from '@/lib/scoring'
import { QUESTIONNAIRE_WEEKS } from '@/lib/questionnaire-config'
import type { Questionnaire } from '@/services/questionnaires'
import type { EducationalMaterial } from '@/services/educational_materials'
import type { QuestionnaireConfig } from '@/services/questionnaire_configs'

export default function PatientQuestionnaires() {
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

  const consultationWeeks = useMemo(
    () =>
      configs
        .filter((c) => {
          const cfg = c.configs as Record<string, unknown>
          return cfg?.has_consultation === true
        })
        .map((c) => c.week_number),
    [configs],
  )

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

  const points = user?.points ?? 0
  const currentWeek = getCurrentWeek(questionnaires)
  const progress = getProgress(questionnaires)
  const xpProgress = getXPProgress(points)
  const completedWeeks = questionnaires.map((q) => q.week_number)
  const userBadges = parseUserBadges(user?.badges)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">📈 Meu Progresso</h1>
        <p className="text-slate-500">Acompanhe sua jornada de 12 semanas no programa.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[#D4AF37]/20 shadow-sm relative overflow-hidden premium-card">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
          <div className="flex items-center gap-2 mb-1 ml-2">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
            <p className="text-sm text-slate-500 font-medium">Semana Atual</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 ml-2">{currentWeek}</p>
        </Card>
        <Card className="p-4 bg-white border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center gap-2 mb-1 ml-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-slate-500 font-medium">Questionários</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            {completedWeeks.length}
            <span className="text-sm font-normal text-slate-400">
              {' '}
              / {QUESTIONNAIRE_WEEKS.length}
            </span>
          </p>
        </Card>
        <Card className="p-4 bg-white border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex items-center gap-2 mb-1 ml-2">
            <Award className="w-4 h-4 text-amber-500" />
            <p className="text-sm text-slate-500 font-medium">Conquistas</p>
          </div>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            🏅 {userBadges.earnedBadges?.length ?? 0}
          </p>
        </Card>
        <Card className="p-4 bg-white border border-indigo-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div className="flex items-center gap-2 mb-1 ml-2">
            <span className="text-sm text-slate-500 font-medium">XP Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 ml-2">
            ⭐ {points}
            <span className="text-sm font-normal text-slate-400"> / {MAX_XP}</span>
          </p>
        </Card>
      </div>

      <Card className="p-6 shadow-sm border-[#D4AF37]/15 premium-card">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Progresso Geral do Programa</span>
            <span className="text-slate-500">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Progresso XP</span>
            <span>
              ⭐ {points} / {MAX_XP} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2.5 bg-slate-100" />
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Acompanhamento</h2>
          <p className="text-sm text-slate-500 mt-1">
            Roadmap completo do programa — visualize todas as atividades, mesmo as de semanas
            bloqueadas.
          </p>
        </div>
        <Roadmap
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
      </section>
    </div>
  )
}
