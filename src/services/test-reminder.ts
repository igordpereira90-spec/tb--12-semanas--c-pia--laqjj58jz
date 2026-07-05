import pb from '@/lib/pocketbase/client'

export interface TestReminderResult {
  checked: number
  remindersCreated: number
  skipped: number
  details: Array<{
    patient: string
    week: number
    status: string
  }>
}

export async function triggerTestReminder(week?: number): Promise<TestReminderResult> {
  return pb.send('/backend/v1/test-reminder', {
    method: 'POST',
    body: JSON.stringify({ week: week ?? null }),
    headers: { 'Content-Type': 'application/json' },
  })
}
