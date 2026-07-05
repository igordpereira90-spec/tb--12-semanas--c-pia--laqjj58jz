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
import { RichTextEditor } from '@/components/professional/RichTextEditor'
import { updateBonus } from '@/services/bonuses'
import type { Bonus } from '@/services/bonuses'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'

interface Props {
  bonus: Bonus
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function BonusEditDialog({ bonus, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(bonus.title || '')
      setContent(bonus.content || '')
      setVideoUrl(bonus.video_url || '')
    }
  }, [open, bonus])

  const contentText = content.replace(/<[^>]*>/g, '').trim()
  const canSave = title.trim().length > 0 && contentText.length > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await updateBonus(bonus.id, {
        title: title.trim(),
        content,
        video_url: videoUrl.trim(),
      })
      toast({ title: 'Sucesso', description: 'Bônus atualizado com sucesso.' })
      onOpenChange(false)
      onSaved()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar o bônus. Tente novamente.',
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
          <DialogTitle className="text-xl">Editar Bônus</DialogTitle>
          <DialogDescription>
            Atualize o conteúdo e o link do vídeo exibidos para os pacientes.
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
              placeholder="Título do bônus"
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Vídeo (URL)</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-slate-50"
            />
            <p className="text-xs text-slate-400">Cole o link do YouTube ou Vimeo.</p>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">
              Conteúdo <span className="text-rose-500">*</span>
            </Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Escreva o conteúdo..."
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
