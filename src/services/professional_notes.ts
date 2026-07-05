import pb from '@/lib/pocketbase/client'
import type { AppUser } from '@/services/users'

export interface ProfessionalNote {
  id: string
  patient: string
  professional: string
  content: string
  created: string
  updated: string
  expand?: { patient?: AppUser; professional?: AppUser }
}

export async function getNotes(patientId: string) {
  return pb.collection('professional_notes').getFullList<ProfessionalNote>({
    filter: `patient = "${patientId}"`,
    sort: '-created',
    expand: 'professional',
  })
}

export async function createNote(patientId: string, professionalId: string, content: string) {
  return pb.collection('professional_notes').create<ProfessionalNote>({
    patient: patientId,
    professional: professionalId,
    content,
  })
}

export async function updateNote(id: string, content: string) {
  return pb.collection('professional_notes').update<ProfessionalNote>(id, { content })
}
