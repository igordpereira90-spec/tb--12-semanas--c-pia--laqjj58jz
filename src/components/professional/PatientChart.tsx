import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { Questionnaire } from '@/services/questionnaires'

const chartConfig = {
  overall_feeling: { label: 'Sensação Geral', color: 'hsl(var(--chart-1))' },
  mood_score: { label: 'Humor', color: 'hsl(var(--chart-2))' },
  energy_score: { label: 'Energia', color: 'hsl(var(--chart-3))' },
  sleep_score: { label: 'Sono', color: 'hsl(var(--chart-4))' },
}

interface Props {
  questionnaires: Questionnaire[]
}

export function PatientChart({ questionnaires }: Props) {
  const data = questionnaires.map((q) => ({
    week: `S${q.week_number}`,
    overall_feeling: q.overall_feeling,
    mood_score: q.mood_score,
    energy_score: q.energy_score,
    sleep_score: q.sleep_score,
  }))

  if (data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-slate-400 text-sm">
        Sem dados para exibir
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b' }}
            dy={10}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 10]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="overall_feeling"
            stroke="var(--color-overall_feeling)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
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
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
