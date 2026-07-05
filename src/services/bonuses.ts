import pb from '@/lib/pocketbase/client'

export interface Bonus {
  id: string
  title: string
  content: string
  video_url: string
  created: string
  updated: string
}

export async function getBonuses() {
  return pb.collection('bonuses').getFullList<Bonus>({
    sort: 'created',
  })
}

export async function updateBonus(
  id: string,
  data: Partial<Pick<Bonus, 'title' | 'content' | 'video_url'>>,
) {
  return pb.collection('bonuses').update<Bonus>(id, data)
}

export async function createBonus(data: { title: string; content: string; video_url?: string }) {
  return pb.collection('bonuses').create<Bonus>(data)
}

export async function deleteBonus(id: string) {
  return pb.collection('bonuses').delete(id)
}
