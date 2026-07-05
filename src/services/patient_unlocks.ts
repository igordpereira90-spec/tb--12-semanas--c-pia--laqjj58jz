import pb from '@/lib/pocketbase/client'

export interface PatientUnlock {
  id: string
  patient: string
  week_number: number
  created: string
  updated: string
}

export async function getUnlockedWeeks(patientId: string): Promise<number[]> {
  const records = await pb.collection('patient_unlocks').getFullList<PatientUnlock>({
    filter: `patient = "${patientId}"`,
    sort: 'week_number',
  })
  return records.map((r) => r.week_number)
}

export async function unlockWeek(patientId: string, week: number): Promise<void> {
  try {
    await pb.collection('patient_unlocks').create({ patient: patientId, week_number: week })
  } catch {
    /* intentionally ignored */
  }
}

export async function lockWeek(patientId: string, week: number): Promise<void> {
  try {
    const record = await pb
      .collection('patient_unlocks')
      .getFirstListItem<PatientUnlock>(`patient = "${patientId}" && week_number = ${week}`)
    await pb.collection('patient_unlocks').delete(record.id)
  } catch {
    /* intentionally ignored */
  }
}
