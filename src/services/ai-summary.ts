import pb from '@/lib/pocketbase/client'

export async function getAIPatientSummary(patientId: string): Promise<string> {
  const res = await pb.send<{ summary: string; error?: string }>('/backend/v1/patient-summary', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.error) throw new Error(res.error)
  return res.summary
}
