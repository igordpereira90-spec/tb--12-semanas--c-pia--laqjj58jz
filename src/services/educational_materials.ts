import pb from '@/lib/pocketbase/client'

export interface EducationalMaterial {
  id: string
  week_number: number
  title: string
  objective: string
  content: string
  created: string
  updated: string
}

export async function getEducationalMaterials() {
  return pb.collection('educational_materials').getFullList<EducationalMaterial>({
    sort: 'week_number',
  })
}

export async function updateEducationalMaterial(id: string, data: Partial<EducationalMaterial>) {
  return pb.collection('educational_materials').update<EducationalMaterial>(id, data)
}

export async function createEducationalMaterial(data: {
  week_number: number
  title: string
  objective?: string
  content?: string
}) {
  return pb.collection('educational_materials').create<EducationalMaterial>(data)
}

export async function upsertEducationalMaterial(
  weekNumber: number,
  data: { title: string; objective?: string; content?: string },
) {
  try {
    const existing = await pb
      .collection('educational_materials')
      .getFirstListItem<EducationalMaterial>(`week_number = ${weekNumber}`)
    return pb.collection('educational_materials').update<EducationalMaterial>(existing.id, data)
  } catch {
    return pb.collection('educational_materials').create<EducationalMaterial>({
      week_number: weekNumber,
      ...data,
    })
  }
}
