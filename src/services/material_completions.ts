import pb from '@/lib/pocketbase/client'

export interface MaterialCompletion {
  id: string
  patient: string
  material: string
  created: string
  updated: string
}

export async function getCompletions(patientId: string): Promise<MaterialCompletion[]> {
  return pb.collection('material_completions').getFullList<MaterialCompletion>({
    filter: `patient = "${patientId}"`,
    sort: '-created',
  })
}

export async function getCompletedMaterialIds(patientId: string): Promise<Set<string>> {
  const completions = await getCompletions(patientId)
  return new Set(completions.map((c) => c.material))
}

export async function markMaterialAsRead(patientId: string, materialId: string): Promise<void> {
  try {
    await pb.collection('material_completions').create({
      patient: patientId,
      material: materialId,
    })
  } catch {
    // Unique constraint — already marked as read (idempotent)
  }
}
