import { useState, useEffect, useCallback } from 'react'
import { getEducationalMaterials } from '@/services/educational_materials'
import type { EducationalMaterial } from '@/services/educational_materials'
import { MaterialEditDialog } from '@/components/professional/MaterialEditDialog'
import { QuestionnaireStructure } from '@/components/professional/QuestionnaireStructure'
import { useRealtime } from '@/hooks/use-realtime'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Edit3, Loader2, CheckCircle2, PlusCircle } from 'lucide-react'

const PROGRAM_WEEKS = Array.from({ length: 13 }, (_, i) => i)

export default function ProQuestionnaireSettings() {
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingWeek, setEditingWeek] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getEducationalMaterials()
      setMaterials(data)
    } catch {
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('educational_materials', () => {
    load()
  })

  const getMaterial = (week: number) => materials.find((m) => m.week_number === week) || null

  const editingMaterial = editingWeek !== null ? getMaterial(editingWeek) : null
  const configuredCount = materials.length

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
            Gestão de Conteúdo
          </h1>
          <p className="text-slate-600">
            Gerencie o material educativo e a estrutura dos questionários de cada semana do programa
            de 12 semanas.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl border border-primary/20 shadow-sm px-4 py-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{configuredCount}</p>
            <p className="text-xs text-slate-500">Configuradas</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-400">
              {PROGRAM_WEEKS.length - configuredCount}
            </p>
            <p className="text-xs text-slate-500">Pendentes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROGRAM_WEEKS.map((week) => {
          const material = getMaterial(week)
          const hasContent = !!material
          return (
            <Card
              key={week}
              className="p-5 hover:shadow-md transition-shadow duration-200 border-primary/10 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Semana
                    </p>
                    <p className="text-xl font-bold text-slate-800 leading-none">{week}</p>
                  </div>
                </div>
                {hasContent ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Configurado
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
                    <PlusCircle className="w-3 h-3 mr-1" /> Pendente
                  </Badge>
                )}
              </div>
              <div className="mb-4 flex-1 min-h-[48px]">
                <p className="text-sm font-semibold text-slate-700 line-clamp-2">
                  {material?.title || 'Nenhum material criado'}
                </p>
                {material?.objective && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{material.objective}</p>
                )}
              </div>
              <Button
                variant={hasContent ? 'outline' : 'default'}
                size="sm"
                className="w-full"
                onClick={() => setEditingWeek(week)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {hasContent ? 'Editar' : 'Configurar'}
              </Button>
            </Card>
          )
        })}
      </div>

      <QuestionnaireStructure />

      <MaterialEditDialog
        weekNumber={editingWeek ?? 0}
        material={editingMaterial}
        open={editingWeek !== null}
        onOpenChange={(o) => {
          if (!o) setEditingWeek(null)
        }}
        onSaved={load}
      />
    </div>
  )
}
