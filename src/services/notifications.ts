import pb from '@/lib/pocketbase/client'

export interface Notification {
  id: string
  recipient: string
  title: string
  message: string
  read: boolean
  type: 'info' | 'success' | 'alert'
  created: string
  updated: string
}

export async function getNotifications(recipientId: string, page = 1, perPage = 20) {
  return pb.collection('notifications').getList<Notification>(page, perPage, {
    filter: `recipient = "${recipientId}"`,
    sort: '-created',
  })
}

export async function getUnreadCount(recipientId: string) {
  const result = await pb.collection('notifications').getList(1, 1, {
    filter: `recipient = "${recipientId}" && read = false`,
  })
  return result.totalItems
}

export async function markAsRead(id: string) {
  return pb.collection('notifications').update(id, { read: true })
}

export async function markAllAsRead(recipientId: string) {
  const unread = await pb.collection('notifications').getFullList({
    filter: `recipient = "${recipientId}" && read = false`,
  })
  await Promise.all(unread.map((n) => pb.collection('notifications').update(n.id, { read: true })))
}
