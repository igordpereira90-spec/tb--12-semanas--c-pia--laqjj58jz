import type { Questionnaire } from '@/services/questionnaires'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAlerts } from '@/lib/patient-utils'
import { Edit3 } from 'lucide-react'

interface Props {
  questionnaires: Questionnaire[]
  onEdit?: (q: Questionnaire) => void
}

export function QuestionnaireHistory({ questionnaires, onEdit }: Props) {
  if (questionnaires.length === 0) {
    return <p className="text-center py-8 text-slate-400">Nenhum questionário preenchido.</p>
  }

  return (
    <div className="space-y-3">
      {questionnaires.map((q) => {
        const alerts = getAlerts(q)
        return (
          <div
            key={q.id}
            className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-bold text-primary text-sm">S{q.week_number}</span>
              </div>
              <div>
                <p className="font-medium text-slate-800">Semana {q.week_number}</p>
                <p className="text-xs text-slate-400">
                  {new Date(q.created).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-5 text-sm items-center">
              <div className="text-center">
                <p className="text-slate-400 text-xs">Humor</p>
                <p className="font-bold text-slate-700">{q.mood_score}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">Energia</p>
                <p className="font-bold text-slate-700">{q.energy_score}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-xs">Sono</p>
                <p className="font-bold text-slate-700">{q.sleep_score}</p>
              </div>
              {alerts.hasAlert && (
                <Badge variant="destructive" className="ml-1">
                  Alerta
                </Badge>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(q)}
                  className="text-primary hover:text-primary"
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
