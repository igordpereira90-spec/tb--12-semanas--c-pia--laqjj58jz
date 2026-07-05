import { CheckCircle2, Clock, Lock, Calendar, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALL_WEEKS, QUESTIONNAIRE_WEEKS, CONSULTATION_WEEKS } from '@/lib/questionnaire-config'

interface TimelineProps {
  completedWeeks: number[]
  unlockedWeeks?: number[]
  materialWeeks?: number[]
  completedMaterialWeeks?: number[]
  questionnaireConfigWeeks?: number[]
  consultationWeeks?: number[]
  onActivityClick?: (week: number, type: 'material' | 'questionnaire' | 'consultation') => void
}

interface ActivityItem {
  label: string
  emoji: string
  completed: boolean
  type: 'material' | 'questionnaire' | 'consultation'
  clickable: boolean
}

export function Timeline({
  completedWeeks,
  unlockedWeeks = [],
  materialWeeks = [],
  completedMaterialWeeks = [],
  questionnaireConfigWeeks = [],
  consultationWeeks = [],
  onActivityClick,
}: TimelineProps) {
  const qWeeks = [...new Set([...QUESTIONNAIRE_WEEKS, ...questionnaireConfigWeeks])]
  const cWeeks = [...new Set([...CONSULTATION_WEEKS, ...consultationWeeks])]

  return (
    <div className="space-y-1">
      {ALL_WEEKS.map((week, idx) => {
        const isCompleted = completedWeeks.includes(week)
        const isQuestionnaire = qWeeks.includes(week)
        const isConsultation = cWeeks.includes(week)
        const hasMaterial = materialWeeks.includes(week)
        const isMaterialCompleted = completedMaterialWeeks.includes(week)
        const prevWeeks = ALL_WEEKS.filter((w) => w < week)
        const isAvailable =
          isCompleted ||
          unlockedWeeks.includes(week) ||
          prevWeeks.every((w) => (qWeeks.includes(w) ? completedWeeks.includes(w) : true))
        const isManuallyUnlocked = !isCompleted && unlockedWeeks.includes(week)
        const isCurrent =
          !isCompleted &&
          isAvailable &&
          (prevWeeks.some((w) => completedWeeks.includes(w)) || week === 0)
        const isLocked = !isCompleted && !isAvailable && !isManuallyUnlocked

        const activities: ActivityItem[] = []
        if (hasMaterial) {
          activities.push({
            label: 'Material Educativo',
            emoji: '📖',
            completed: isMaterialCompleted,
            type: 'material',
            clickable: !isLocked && !!onActivityClick,
          })
        }
        if (isQuestionnaire) {
          activities.push({
            label: 'Questionário',
            emoji: '📝',
            completed: isCompleted,
            type: 'questionnaire',
            clickable: !isLocked && !!onActivityClick,
          })
        }
        if (isConsultation) {
          activities.push({
            label: 'Consulta',
            emoji: '🩺',
            completed: isCompleted,
            type: 'consultation',
            clickable: false,
          })
        }

        return (
          <div key={week} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 z-10 text-base',
                  isCompleted
                    ? 'bg-amber-100 shadow-sm'
                    : isCurrent
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                      : isManuallyUnlocked
                        ? 'bg-indigo-100 shadow-sm ring-2 ring-indigo-200'
                        : 'bg-slate-100',
                )}
              >
                {isCompleted
                  ? '✅'
                  : isCurrent
                    ? '⏳'
                    : isManuallyUnlocked
                      ? '🔓'
                      : isConsultation
                        ? '🩺'
                        : '🔒'}
              </div>
              {idx < ALL_WEEKS.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[2rem] my-1 rounded-full',
                    isCompleted ? 'bg-amber-300' : 'bg-slate-200',
                  )}
                />
              )}
            </div>

            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={cn(
                    'font-semibold text-sm',
                    isCurrent ? 'text-primary' : isCompleted ? 'text-slate-700' : 'text-slate-500',
                  )}
                >
                  Semana {week}
                </span>
                {isCurrent && (
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    ⏳ Atual
                  </span>
                )}
                {isLocked && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    🔒 Bloqueada
                  </span>
                )}
                {isManuallyUnlocked && (
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    🔓 Liberada
                  </span>
                )}
                {isCompleted && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✅ Concluída
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {activities.length > 0 ? (
                  activities.map((act) => {
                    return (
                      <div
                        key={act.label}
                        onClick={() => {
                          if (act.clickable && onActivityClick) {
                            onActivityClick(week, act.type)
                          }
                        }}
                        className={cn(
                          'flex items-center gap-2 text-sm rounded-lg px-3 py-1.5 transition-colors',
                          act.completed
                            ? 'bg-emerald-50 text-emerald-700'
                            : isLocked
                              ? 'bg-slate-50 text-slate-400'
                              : 'bg-slate-50 text-slate-600',
                          act.clickable && 'cursor-pointer hover:bg-slate-100 hover:shadow-sm',
                          !act.clickable && 'cursor-default',
                        )}
                      >
                        <span className="text-base shrink-0">{act.emoji}</span>
                        <span className="flex-1">{act.label}</span>
                        {act.completed ? (
                          <span className="text-xs text-emerald-600 font-semibold shrink-0">
                            ✅ Concluído
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'text-xs font-medium shrink-0',
                              isLocked ? 'text-slate-400' : 'text-slate-500',
                            )}
                          >
                            {isLocked ? '🔒' : '⏳'} Pendente
                          </span>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-xs text-slate-400 italic px-3 py-1.5">
                    📅 Nenhuma atividade agendada
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
