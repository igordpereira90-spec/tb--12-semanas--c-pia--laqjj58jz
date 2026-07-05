import { ALERT_FREQ_VALUES, QUESTIONNAIRE_WEEKS } from '@/lib/questionnaire-config'
import type { Questionnaire } from '@/services/questionnaires'

export interface Medal {
  id: number
  name: string
  desc: string
  earned: boolean
  icon: string
}

export function calculateMedals(questionnaires: Questionnaire[]): Medal[] {
  const weeks = questionnaires.map((q) => q.week_number)
  return [
    {
      id: 1,
      name: 'Início',
      desc: 'Completou a Semana 0',
      earned: weeks.includes(0),
      icon: 'Award',
    },
    {
      id: 2,
      name: 'Constância',
      desc: '2 questionários seguidos',
      earned: weeks.length >= 2,
      icon: 'Flame',
    },
    {
      id: 3,
      name: 'Engajamento',
      desc: 'Mais da metade do programa',
      earned: weeks.length >= 3,
      icon: 'Star',
    },
    {
      id: 4,
      name: 'Acompanhamento',
      desc: '12 semanas concluídas',
      earned: weeks.length >= QUESTIONNAIRE_WEEKS.length,
      icon: 'Trophy',
    },
  ]
}

export function getAlerts(q: Questionnaire): { hasAlert: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (q.sleep_score < 4) reasons.push('Qualidade do sono crítica')
  if (ALERT_FREQ_VALUES.includes(q.risky_behavior)) reasons.push('Comportamento de risco elevado')
  if (ALERT_FREQ_VALUES.includes(q.insomnia_freq)) reasons.push('Insônia frequente')
  if (ALERT_FREQ_VALUES.includes(q.euphoria)) reasons.push('Euforia elevada')
  return { hasAlert: reasons.length > 0, reasons }
}

export function getPatientStatus(questionnaires: Questionnaire[]): 'attention' | 'pending' | 'ok' {
  if (questionnaires.length === 0) return 'pending'
  const latest = [...questionnaires].sort((a, b) => b.week_number - a.week_number)[0]
  if (getAlerts(latest).hasAlert) return 'attention'
  const completedWeeks = questionnaires.map((q) => q.week_number)
  const allDone = QUESTIONNAIRE_WEEKS.every((w) => completedWeeks.includes(w))
  return allDone ? 'ok' : 'pending'
}

export function getCurrentWeek(questionnaires: Questionnaire[]): number {
  if (questionnaires.length === 0) return 0
  const maxWeek = Math.max(...questionnaires.map((q) => q.week_number))
  const nextWeek = QUESTIONNAIRE_WEEKS.find((w) => w > maxWeek)
  return nextWeek ?? 12
}

export function getProgress(questionnaires: Questionnaire[]): number {
  const distinctWeeks = new Set(questionnaires.map((q) => q.week_number))
  return Math.round((distinctWeeks.size / QUESTIONNAIRE_WEEKS.length) * 100)
}

export function generateSummary(questionnaires: Questionnaire[]): string {
  if (questionnaires.length < 2)
    return 'Paciente em fase inicial do programa. Aguardando mais dados para análise comparativa.'
  const sorted = [...questionnaires].sort((a, b) => a.week_number - b.week_number)
  const baseline = sorted[0]
  const latest = sorted[sorted.length - 1]
  const parts: string[] = []
  if (latest.mood_score > baseline.mood_score)
    parts.push(`melhora no humor (${baseline.mood_score} → ${latest.mood_score})`)
  else if (latest.mood_score < baseline.mood_score)
    parts.push(`piora no humor (${baseline.mood_score} → ${latest.mood_score})`)
  if (latest.sleep_score > baseline.sleep_score) parts.push('melhora na qualidade do sono')
  else if (latest.sleep_score < baseline.sleep_score) parts.push('piora na qualidade do sono')
  if (latest.energy_score > baseline.energy_score + 2)
    parts.push('aumento significativo de energia (atenção a sinais hipomaníacos)')
  const { hasAlert, reasons } = getAlerts(latest)
  if (hasAlert) parts.push(`alertas: ${reasons.join(', ')}`)
  return `Paciente apresentou ${parts.join(', ')}.`
}

export function isQuestionnaireAccessible(
  week: number,
  completedWeeks: number[],
  unlockedWeeks: number[],
  questionnaireWeeks: number[],
  allWeeks: number[],
): boolean {
  if (week === 0) return true
  if (unlockedWeeks.includes(week)) return true
  if (!questionnaireWeeks.includes(week)) return false
  const prevWeeks = allWeeks.filter((w) => w < week)
  return prevWeeks.every((w) =>
    questionnaireWeeks.includes(w) ? completedWeeks.includes(w) : true,
  )
}

export function isMaterialAccessible(
  week: number,
  programWeek: number,
  unlockedWeeks: number[],
): boolean {
  if (unlockedWeeks.includes(week)) return true
  return week <= programWeek
}

export function getProgramWeek(questionnaires: Questionnaire[]): number {
  if (questionnaires.length === 0) return 0
  const sorted = [...questionnaires].sort((a, b) => a.week_number - b.week_number)
  const start = new Date(sorted[0].created).getTime()
  const diff = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 7))
  return Math.max(0, diff)
}
