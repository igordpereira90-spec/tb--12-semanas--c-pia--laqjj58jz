import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QUESTIONNAIRE_WEEKS } from '@/lib/questionnaire-config'
import type { Questionnaire } from '@/services/questionnaires'
import { MessageSquareText, CalendarDays, FileText } from 'lucide-react'

interface Props {
  questionnaires: Questionnaire[]
}

export function QualitativeTimeline({ questionnaires }: Props) {
  const weekData = QUESTIONNAIRE_WEEKS.map((w) => ({
    week: w,
    data: questionnaires.find((q) => q.week_number === w),
  })).filter((w) => w.data)

  if (weekData.length === 0) {
    return (
      <p className="text-center py-8 text-slate-400">Nenhuma resposta qualitativa registrada.</p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquareText className="w-4 h-4 text-[#D4AF37]" />
        <p className="text-sm text-slate-500">
          Respostas subjetivas do paciente organizadas por semana do programa
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {weekData.map(({ week, data }) => {
          if (!data) return null
          const hasEvolution = data.specific_evolution?.trim()
          const hasExpectations = data.future_expectations?.trim()
          const hasAny = hasEvolution || hasExpectations

          return (
            <Card
              key={week}
              className="p-5 border-[#D4AF37]/15 shadow-sm hover:shadow-md transition-shadow duration-200 premium-card"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-primary/10">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Semana {week}</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(data.created).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {hasAny ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-xs font-semibold text-[#B8941F] uppercase tracking-wide">
                        Evolução Específica
                      </span>
                    </div>
                    {hasEvolution ? (
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 rounded-md p-3 border border-slate-100">
                        {data.specific_evolution}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-300 italic px-3">
                        Sem observações registradas
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span className="text-xs font-semibold text-[#B8941F] uppercase tracking-wide">
                        Expectativas Futuras
                      </span>
                    </div>
                    {hasExpectations ? (
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 rounded-md p-3 border border-slate-100">
                        {data.future_expectations}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-300 italic px-3">
                        Sem observações registradas
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-3">
                  <Badge variant="outline" className="text-slate-400 border-slate-200 font-normal">
                    Sem observações registradas
                  </Badge>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
