import pb from '@/lib/pocketbase/client'
import type { AppUser } from '@/services/users'

export interface AuditLog {
  id: string
  actor: string
  action: string
  resource_id: string
  metadata: unknown
  created: string
  updated: string
  expand?: { actor?: AppUser }
}

export async function getAuditLogs(page = 1, perPage = 50, actionFilter?: string) {
  const filter = actionFilter ? `action = "${actionFilter}"` : ''
  return pb.collection('audit_logs').getList<AuditLog>(page, perPage, {
    filter,
    sort: '-created',
    expand: 'actor',
  })
}

export async function logAction(
  action: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
) {
  return pb.send('/backend/v1/audit/log', {
    method: 'POST',
    body: JSON.stringify({ action, resource_id: resourceId || '', metadata: metadata || {} }),
    headers: { 'Content-Type': 'application/json' },
  })
}
