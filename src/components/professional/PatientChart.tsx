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
  mood_score: { label: 'Humor', color: '#D4AF37' },
  energy_score: { label: 'Energia', color: '#3B7EA1' },
  sleep_score: { label: 'Sono', color: '#5B9279' },
  overall_feeling: { label: 'Sensação Geral', color: '#C97B4F' },
}

const attentionConfig = {
  attention_score: { label: 'Atenção', color: '#D4AF37' },
  inattention_avg: { label: 'Desatenção (média)', color: '#8B6BB1' },
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
                stroke="#D4AF37"
                strokeWidth={3}
                dot={{ r: 4, fill: '#D4AF37' }}
              />
              <Line
                type="monotone"
                dataKey="energy_score"
                stroke="#3B7EA1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3B7EA1' }}
              />
              <Line
                type="monotone"
                dataKey="sleep_score"
                stroke="#5B9279"
                strokeWidth={3}
                dot={{ r: 4, fill: '#5B9279' }}
              />
              <Line
                type="monotone"
                dataKey="overall_feeling"
                stroke="#C97B4F"
                strokeWidth={3}
                dot={{ r: 4, fill: '#C97B4F' }}
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
                stroke="#D4AF37"
                strokeWidth={3}
                dot={{ r: 4, fill: '#D4AF37' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="inattention_avg"
                stroke="#8B6BB1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#8B6BB1' }}
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
