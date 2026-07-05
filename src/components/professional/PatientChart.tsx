import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { Questionnaire } from '@/services/questionnaires'

const INATTENTION_FIELDS = [
  'inattention_details',
  'inattention_focus',
  'inattention_listening',
  'inattention_followthrough',
  'inattention_organization',
  'inattention_mental_effort',
  'inattention_losing_things',
]

const depressionConfig = {
  mood_score: { label: 'Humor', color: 'hsl(var(--chart-1))' },
  energy_score: { label: 'Energia', color: 'hsl(var(--chart-2))' },
  sleep_score: { label: 'Sono', color: 'hsl(var(--chart-3))' },
  overall_feeling: { label: 'Sensação Geral', color: 'hsl(var(--chart-4))' },
}

const attentionConfig = {
  attention_score: { label: 'Atenção', color: 'hsl(var(--chart-1))' },
  inattention_avg: { label: 'Desatenção (média)', color: 'hsl(var(--chart-5))' },
}

interface Props {
  questionnaires: Questionnaire[]
}

export function PatientChart({ questionnaires }: Props) {
  if (questionnaires.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
        Sem dados para exibir
      </div>
    )
  }

  const depressionData = questionnaires.map((q) => ({
    week: `S${q.week_number}`,
    mood_score: q.mood_score,
    energy_score: q.energy_score,
    sleep_score: q.sleep_score,
    overall_feeling: q.overall_feeling,
  }))

  const attentionData = questionnaires.map((q) => {
    const validScores = INATTENTION_FIELDS.map((f) => q[f as keyof Questionnaire] as number).filter(
      (v) => typeof v === 'number' && !isNaN(v),
    )
    const avg =
      validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null
    return {
      week: `S${q.week_number}`,
      attention_score: q.attention_score ?? null,
      inattention_avg: avg !== null ? Math.round(avg * 10) / 10 : null,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          Depressão e Ansiedade (Scores 0-10)
        </h3>
        <ChartContainer config={depressionConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={depressionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b' }}
                domain={[0, 10]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="mood_score"
                stroke="var(--color-mood_score)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="energy_score"
                stroke="var(--color-energy_score)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sleep_score"
                stroke="var(--color-sleep_score)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="overall_feeling"
                stroke="var(--color-overall_feeling)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3">
          Atenção e Desatenção (Scores 0-10)
        </h3>
        <ChartContainer config={attentionConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attentionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b' }}
                domain={[0, 10]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="attention_score"
                stroke="var(--color-attention_score)"
                strokeWidth={3}
                dot={{ r: 4 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="inattention_avg"
                stroke="var(--color-inattention_avg)"
                strokeWidth={3}
                dot={{ r: 4 }}
                strokeDasharray="5 5"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
