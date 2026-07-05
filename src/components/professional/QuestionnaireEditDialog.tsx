import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QuestionnaireForm } from '@/components/patient/QuestionnaireForm'
import type { Questionnaire } from '@/services/questionnaires'

interface Props {
  questionnaire: Questionnaire | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function QuestionnaireEditDialog({ questionnaire, open, onOpenChange, onSubmit }: Props) {
  const [cachedQ, setCachedQ] = useState<Questionnaire | null>(questionnaire)

  useEffect(() => {
    if (questionnaire) setCachedQ(questionnaire)
  }, [questionnaire])

  if (!cachedQ) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Editar Questionário — Semana {cachedQ.week_number}
          </DialogTitle>
        </DialogHeader>
        <QuestionnaireForm
          key={cachedQ.id}
          week={cachedQ.week_number}
          onSubmit={onSubmit}
          initialData={cachedQ as Record<string, unknown>}
          submitLabel="Salvar Alterações"
          isEditing
        />
      </DialogContent>
    </Dialog>
  )
}
