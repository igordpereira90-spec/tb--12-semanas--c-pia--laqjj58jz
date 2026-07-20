import pb from '@/lib/pocketbase/client'

export interface AppUser {
  id: string
  name: string
  email: string
  avatar: string
  role: 'patient' | 'professional'
  points: number
  badges: unknown
  consent_accepted: boolean
  consent_date: string | null
  age: number | null
  created: string
  updated: string
}

export async function getPatients() {
  return pb.collection('users').getFullList<AppUser>({
    filter: 'role = "patient"',
    sort: 'name',
  })
}

export async function getUser(id: string) {
  return pb.collection('users').getOne<AppUser>(id)
}

export async function updateUser(id: string, data: Partial<{ name: string }>) {
  return pb.collection('users').update<AppUser>(id, data)
}

export async function deleteUser(id: string) {
  return pb.collection('users').delete(id)
}
