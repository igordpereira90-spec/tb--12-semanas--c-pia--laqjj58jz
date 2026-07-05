import { useState, useEffect } from 'react'
import {
  getEducationalMaterials,
  updateEducationalMaterial,
} from '@/services/educational_materials'
import type { EducationalMaterial } from '@/services/educational_materials'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Edit3, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ProMaterials() {
  const { toast } = useToast()
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [editing, setEditing] = useState<EducationalMaterial | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await getEducationalMaterials()
      setMaterials(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await updateEducationalMaterial(editing.id, {
        title: editing.title,
        objective: editing.objective,
        content: editing.content,
      })
      toast({ title: 'Sucesso', description: 'Material atualizado com sucesso.' })
      setEditing(null)
      load()
    } catch (e) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Material Educativo</h1>
        <p className="text-slate-600">
          Gerencie o conteúdo psicoeducativo exibido para os pacientes a cada semana.
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-24">Semana</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((m) => (
              <TableRow key={m.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-700">S{m.week_number}</TableCell>
                <TableCell className="text-slate-600">{m.title}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(m)}
                    className="text-primary hover:text-primary"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {materials.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhum material encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Editar Material — Semana {editing?.week_number}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Título</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Objetivo</Label>
                <Textarea
                  value={editing.objective}
                  onChange={(e) => setEditing({ ...editing, objective: e.target.value })}
                  className="min-h-[80px] bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Conteúdo (HTML)</span>
                  <span className="text-xs font-normal text-slate-400">
                    Use as tags &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt; e &lt;li&gt;
                  </span>
                </Label>
                <Textarea
                  className="min-h-[400px] font-mono text-sm leading-relaxed bg-slate-900 text-slate-100 p-4 rounded-xl border-none"
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving} className="min-w-32">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
