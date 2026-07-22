import pb from '@/lib/pocketbase/client'
import type { AppUser } from '@/services/users'

export interface Questionnaire {
  id: string
  patient: string
  week_number: number
  overall_feeling: number
  improvement_areas: string[]
  improvement_areas_other?: string
  mood_score: number
  energy_score: number
  sleep_score: number
  anxiety_freq: string
  insomnia_freq: string
  daytime_sleepiness: string
  talkativeness: string
  racing_thoughts: string
  increased_goal_activity: string
  risky_behavior: string
  euphoria: string
  depressed_mood: string
  loss_of_interest: string
  concentration_change: string
  physical_activity: string
  appetite_weight_change: string
  functional_impairment: string
  specific_evolution: string
  future_expectations: string
  worry_freq?: string
  irritability_freq?: string
  muscle_tension_freq?: string
  attention_score?: number
  inattention_details?: number
  inattention_focus?: number
  inattention_listening?: number
  inattention_followthrough?: number
  inattention_organization?: number
  inattention_mental_effort?: number
  inattention_losing_things?: number
  created: string
  updated: string
  expand?: { patient?: AppUser }
}

export async function getQuestionnaires(patientId?: string) {
  const filter = patientId ? `patient = "${patientId}"` : ''
  return pb.collection('questionnaires').getFullList<Questionnaire>({
    filter,
    sort: 'week_number',
    expand: 'patient',
  })
}

export async function createQuestionnaire(data: Partial<Questionnaire>) {
  return pb.collection('questionnaires').create<Questionnaire>(data)
}

export async function updateQuestionnaire(id: string, data: Partial<Questionnaire>) {
  return pb.collection('questionnaires').update<Questionnaire>(id, data)
}

export async function getQuestionnaireByWeek(patientId: string, week: number) {
  try {
    return await pb
      .collection('questionnaires')
      .getFirstListItem<Questionnaire>(`patient = "${patientId}" && week_number = ${week}`)
  } catch {
    return null
  }
}

export async function getOrCreateQuestionnaireDraft(
  patientId: string,
  week: number,
  data?: Partial<Questionnaire>,
) {
  const existing = await getQuestionnaireByWeek(patientId, week)
  if (existing) return existing
  return createQuestionnaire({ ...data, patient: patientId, week_number: week })
}
