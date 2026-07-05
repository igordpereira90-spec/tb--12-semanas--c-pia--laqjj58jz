import { QUESTIONNAIRE_WEEKS, FREQUENCY_FIELDS } from '@/lib/questionnaire-config'
import type { Questionnaire } from '@/services/questionnaires'

const SHORT_LABELS: Record<string, string> = {
  anxiety_freq: 'Ansiedade',
  insomnia_freq: 'Insônia',
  daytime_sleepiness: 'Sonolência',
  worry_freq: 'Preocupação',
  irritability_freq: 'Irritabilidade',
  muscle_tension_freq: 'Tensão muscular',
  depressed_mood: 'Humor deprimido',
  loss_of_interest: 'Perda interesse',
  concentration_change: 'Concentração',
  physical_activity: 'Ativ. física',
  appetite_weight_change: 'Apetite/Peso',
  functional_impairment: 'Prejuízo func.',
  attention_score: 'Atenção',
  inattention_details: 'Erros/detalhes',
  inattention_focus: 'Foco',
  inattention_listening: 'Escuta',
  inattention_followthrough: 'Seguir instr.',
  inattention_organization: 'Organização',
  inattention_mental_effort: 'Esforço mental',
  inattention_losing_things: 'Perde coisas',
}

const SCORE_ROWS = [
  { label: 'Humor', key: 'mood_score' },
  { label: 'Energia', key: 'energy_score' },
  { label: 'Sono', key: 'sleep_score' },
  { label: 'Sensação Geral', key: 'overall_feeling' },
  { label: 'Atenção', key: 'attention_score' },
]

const INATTENTION_ROWS = [
  { label: SHORT_LABELS.inattention_details, key: 'inattention_details' },
  { label: SHORT_LABELS.inattention_focus, key: 'inattention_focus' },
  { label: SHORT_LABELS.inattention_listening, key: 'inattention_listening' },
  { label: SHORT_LABELS.inattention_followthrough, key: 'inattention_followthrough' },
  { label: SHORT_LABELS.inattention_organization, key: 'inattention_organization' },
  { label: SHORT_LABELS.inattention_mental_effort, key: 'inattention_mental_effort' },
  { label: SHORT_LABELS.inattention_losing_things, key: 'inattention_losing_things' },
]

const QUALITATIVE_ROWS = [
  { label: 'Evolução Específica', key: 'specific_evolution' },
  { label: 'Expectativas Futuras', key: 'future_expectations' },
]

interface Props {
  questionnaires: Questionnaire[]
}

export function LongitudinalTable({ questionnaires }: Props) {
  const weekData = QUESTIONNAIRE_WEEKS.map((w) => ({
    week: w,
    data: questionnaires.find((q) => q.week_number === w),
  }))

  const allRows = [
    ...SCORE_ROWS,
    ...FREQUENCY_FIELDS.map((f) => ({ label: SHORT_LABELS[f.name] || f.label, key: f.name })),
    { label: SHORT_LABELS.appetite_weight_change, key: 'appetite_weight_change' },
    { label: SHORT_LABELS.functional_impairment, key: 'functional_impairment' },
  ]

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-100">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="bg-[#D4AF37]/5 border-b border-[#D4AF37]/10">
            <th className="text-left py-3 px-3 font-semibold text-[#B8941F] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
              Métrica
            </th>
            {weekData.map((w) => (
              <th
                key={w.week}
                className="text-center py-3 px-3 font-semibold text-primary min-w-[90px]"
              >
                Semana {w.week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allRows.map((row, idx) => (
            <tr
              key={row.key}
              className={
                idx < SCORE_ROWS.length
                  ? 'bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10'
                  : 'hover:bg-slate-50'
              }
            >
              <td className="py-2.5 px-3 font-medium text-slate-700 sticky left-0 bg-white z-10 border-b border-slate-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                {row.label}
              </td>
              {weekData.map((w) => {
                const val = w.data ? w.data[row.key as keyof Questionnaire] : null
                return (
                  <td
                    key={w.week}
                    className="text-center py-2.5 px-3 text-slate-600 border-b border-slate-50"
                  >
                    {val !== null && val !== undefined && val !== '' ? String(val) : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-[#D4AF37]/10 border-t-2 border-[#D4AF37]/20">
            <td
              colSpan={weekData.length + 1}
              className="py-2 px-3 text-xs font-bold text-[#B8941F] uppercase tracking-wide"
            >
              Desatenção (TDAH) — 0 a 10
            </td>
          </tr>
          {INATTENTION_ROWS.map((row) => (
            <tr key={row.key} className="hover:bg-slate-50">
              <td className="py-2.5 px-3 font-medium text-slate-700 sticky left-0 bg-white z-10 border-b border-slate-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                {row.label}
              </td>
              {weekData.map((w) => {
                const val = w.data ? w.data[row.key as keyof Questionnaire] : null
                return (
                  <td
                    key={w.week}
                    className="text-center py-2.5 px-3 text-slate-600 border-b border-slate-50"
                  >
                    {val !== null && val !== undefined && val !== '' ? String(val) : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
          <tr className="bg-[#D4AF37]/10 border-t-2 border-[#D4AF37]/20">
            <td
              colSpan={weekData.length + 1}
              className="py-2 px-3 text-xs font-bold text-[#B8941F] uppercase tracking-wide"
            >
              Respostas Qualitativas
            </td>
          </tr>
          {QUALITATIVE_ROWS.map((row) => (
            <tr key={row.key} className="hover:bg-slate-50 align-top">
              <td className="py-3 px-3 font-medium text-slate-700 sticky left-0 bg-white z-10 border-b border-slate-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                {row.label}
              </td>
              {weekData.map((w) => {
                const val = w.data
                  ? (w.data[row.key as keyof Questionnaire] as string | null | undefined)
                  : null
                return (
                  <td
                    key={w.week}
                    className="py-3 px-3 text-slate-600 border-b border-slate-50 max-w-[200px]"
                  >
                    {val && val.trim() ? (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                        {val}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Sem dados</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
