import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/professional/RichTextEditor'
import { upsertEducationalMaterial } from '@/services/educational_materials'
import type { EducationalMaterial } from '@/services/educational_materials'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

interface Props {
  weekNumber: number
  material: EducationalMaterial | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function MaterialEditDialog({ weekNumber, material, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(material?.title || '')
      setObjective(material?.objective || '')
      setContent(material?.content || '')
    }
  }, [open, material])

  const contentText = content.replace(/<[^>]*>/g, '').trim()
  const canSave = title.trim().length > 0 && contentText.length > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await upsertEducationalMaterial(weekNumber, {
        title: title.trim(),
        objective: objective.trim(),
        content,
      })
      toast({ title: 'Sucesso', description: 'Material salvo e sincronizado com sucesso.' })
      onOpenChange(false)
      onSaved()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar o material. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Material — Semana {weekNumber}</DialogTitle>
          <DialogDescription>
            Modifique o conteúdo educativo exibido para os pacientes nesta semana. O número da
            semana é fixo e não pode ser alterado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">
              Título <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do material da semana"
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Objetivo</Label>
            <Textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Objetivo de aprendizado da semana"
              className="min-h-[80px] bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">
              Conteúdo <span className="text-rose-500">*</span>
            </Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Escreva o conteúdo educativo..."
            />
            {!canSave && (title.trim().length > 0 || contentText.length > 0) && (
              <p className="text-xs text-rose-500">Título e conteúdo são obrigatórios.</p>
            )}
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !canSave} className="min-w-32">
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
