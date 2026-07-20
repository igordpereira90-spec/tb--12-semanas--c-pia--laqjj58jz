import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateUser } from '@/services/users'
import type { AppUser } from '@/services/users'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

interface Props {
  patient: AppUser
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditPatientNameDialog({ patient, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(patient.name || '')
    }
  }, [open, patient])

  const canSave = name.trim().length > 0 && name.trim() !== patient.name

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await updateUser(patient.id, { name: name.trim() })
      toast({ title: 'Sucesso', description: 'Nome do paciente atualizado.' })
      onOpenChange(false)
      onSaved()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar o nome. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-800">Editar Nome do Paciente</DialogTitle>
          <DialogDescription>Atualize o nome exibido para este paciente.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">
              Nome <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do paciente"
              className="bg-slate-50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave && !saving) {
                  handleSave()
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="min-w-32 bg-[#D4AF37] hover:bg-[#B8941F] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
