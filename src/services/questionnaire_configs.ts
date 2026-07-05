import pb from '@/lib/pocketbase/client'

export interface QuestionnaireConfig {
  id: string
  week_number: number
  configs: Record<string, unknown>
  created: string
  updated: string
}

export async function getQuestionnaireConfigs() {
  return pb.collection('questionnaire_configs').getFullList<QuestionnaireConfig>({
    sort: 'week_number',
  })
}

export async function getQuestionnaireConfigByWeek(week: number) {
  try {
    return await pb
      .collection('questionnaire_configs')
      .getFirstListItem<QuestionnaireConfig>(`week_number = ${week}`)
  } catch {
    return null
  }
}

export async function upsertQuestionnaireConfig(week: number, configs: Record<string, unknown>) {
  const existing = await getQuestionnaireConfigByWeek(week)
  if (existing) {
    return pb
      .collection('questionnaire_configs')
      .update<QuestionnaireConfig>(existing.id, { configs })
  }
  return pb
    .collection('questionnaire_configs')
    .create<QuestionnaireConfig>({ week_number: week, configs })
}
