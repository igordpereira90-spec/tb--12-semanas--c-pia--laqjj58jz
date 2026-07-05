import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, Loader2, Brain, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Questionnaire } from '@/services/questionnaires'
import { getAIPatientSummary } from '@/services/ai-summary'

type MetricKey =
  | 'mood_score'
  | 'sleep_score'
  | 'energy_score'
  | 'overall_feeling'
  | 'attention_score'

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'mood_score', label: 'Humor' },
  { key: 'sleep_score', label: 'Sono' },
  { key: 'energy_score', label: 'Energia' },
  { key: 'overall_feeling', label: 'Sensação Geral' },
  { key: 'attention_score', label: 'Atenção' },
]

function getScoreClass(score: number): string {
  if (score <= 3) return 'bg-rose-50 text-rose-700 border-rose-200'
  if (score <= 6) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

function TrendIcon({ diff }: { diff: number | null }) {
  if (diff === null) return <span className="w-3.5 h-3.5 inline-block" />
  if (diff > 0) return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
  if (diff < 0) return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
  return <Minus className="w-3.5 h-3.5 text-slate-400" />
}

interface Props {
  questionnaires: Questionnaire[]
  patientId: string
}

export function WeeklyEvolution({ questionnaires, patientId }: Props) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | 'all'>('all')
  const [aiSummary, setAiSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  const sorted = useMemo(
    () => [...questionnaires].sort((a, b) => a.week_number - b.week_number),
    [questionnaires],
  )
  const weekKey = useMemo(() => sorted.map((q) => q.week_number).join(','), [sorted])

  useEffect(() => {
    if (sorted.length === 0) return
    setSummaryLoading(true)
    getAIPatientSummary(patientId)
      .then(setAiSummary)
      .catch(() => setAiSummary('Não foi possível gerar o resumo no momento.'))
      .finally(() => setSummaryLoading(false))
  }, [patientId, weekKey])

  const visibleMetrics =
    selectedMetric === 'all' ? METRICS : METRICS.filter((m) => m.key === selectedMetric)

  return (
    <Card className="p-6 border-primary/10 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
        <Calendar className="w-5 h-5 mr-2 text-primary" /> Evolução Semanal
      </h2>

      <div className="flex gap-2 flex-wrap mb-5">
        <Button
          size="sm"
          variant={selectedMetric === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedMetric('all')}
          className={cn('rounded-full', selectedMetric === 'all' && 'bg-primary text-white')}
        >
          Todos
        </Button>
        {METRICS.map((m) => (
          <Button
            key={m.key}
            size="sm"
            variant={selectedMetric === m.key ? 'default' : 'outline'}
            onClick={() => setSelectedMetric(m.key)}
            className={cn('rounded-full', selectedMetric === m.key && 'bg-primary text-white')}
          >
            {m.label}
          </Button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Sem dados de questionários para exibir.
        </div>
      ) : sorted.length === 1 ? (
        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-slate-100">
          Apenas a Semana {sorted[0].week_number} foi preenchida. Mais dados são necessários para
          comparação semanal.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="bg-primary/5 border-b border-primary/10">
                <th className="text-left py-3 px-3 font-semibold text-primary sticky left-0 bg-white z-10">
                  Métrica
                </th>
                {sorted.map((q) => (
                  <th
                    key={q.week_number}
                    className="text-center py-3 px-3 font-semibold text-primary min-w-[80px]"
                  >
                    S{q.week_number}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleMetrics.map((metric) => (
                <tr key={metric.key} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-medium text-slate-700 sticky left-0 bg-white z-10 border-b border-slate-100">
                    {metric.label}
                  </td>
                  {sorted.map((q, idx) => {
                    const score = q[metric.key]
                    const prevScore = idx > 0 ? sorted[idx - 1][metric.key] : null
                    const diff = prevScore !== null ? score - prevScore : null
                    return (
                      <td
                        key={q.week_number}
                        className="text-center py-3 px-3 border-b border-slate-50"
                      >
                        <div className="inline-flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-9 h-9 rounded-lg border font-bold text-sm transition-colors',
                              getScoreClass(score),
                            )}
                          >
                            {score}
                          </span>
                          <TrendIcon diff={diff} />
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-slate-50 rounded-lg border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" />
          <strong className="text-sm text-slate-900">Resumo Inteligente (IA)</strong>
        </div>
        {summaryLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analisando dados do paciente...
          </div>
        ) : (
          <p className="text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
        )}
      </div>
    </Card>
  )
}
