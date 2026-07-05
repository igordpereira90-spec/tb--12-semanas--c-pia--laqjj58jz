import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUnlocks } from '@/hooks/use-unlocks'
import { useMaterialCompletions } from '@/hooks/use-material-completions'
import { useToast } from '@/hooks/use-toast'
import { getEducationalMaterials } from '@/services/educational_materials'
import { markMaterialAsRead } from '@/services/material_completions'
import { recordMaterialRead, refreshAuthUser } from '@/services/gamification'
import { getQuestionnaires } from '@/services/questionnaires'
import { MAX_XP } from '@/lib/scoring'
import type { EducationalMaterial } from '@/services/educational_materials'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Star, CheckCircle2 } from 'lucide-react'

export default function PatientLibrary() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { completedMaterialIds } = useMaterialCompletions(user?.id)
  const [materials, setMaterials] = useState<EducationalMaterial[]>([])
  const [programWeek, setProgramWeek] = useState(0)
  const [reading, setReading] = useState<EducationalMaterial | null>(null)
  const [marking, setMarking] = useState(false)
  const { unlockedWeeks } = useUnlocks(user?.id)

  useEffect(() => {
    async function load() {
      if (!user?.id) return
      const [mats, qs] = await Promise.all([getEducationalMaterials(), getQuestionnaires(user.id)])
      let pWeek = 0
      if (qs.length > 0) {
        const sorted = [...qs].sort((a, b) => a.week_number - b.week_number)
        const start = new Date(sorted[0].created).getTime()
        const diff = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 7))
        pWeek = Math.max(0, diff)
      }
      setProgramWeek(pWeek)
      setMaterials(mats)
    }
    load()
  }, [user?.id])

  const visibleMaterials = materials.filter(
    (m) => m.week_number <= programWeek || unlockedWeeks.includes(m.week_number),
  )

  const handleMarkAsRead = async (material: EducationalMaterial) => {
    if (!user?.id || completedMaterialIds.has(material.id)) return
    setMarking(true)
    try {
      await markMaterialAsRead(user.id, material.id)
      await recordMaterialRead(material.id)
      await refreshAuthUser()
      toast({
        title: 'Material concluído!',
        description: '+5 pontos — parabéns!',
        duration: 3000,
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar como lido.',
        duration: 3000,
      })
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">📚 Material Educativo</h1>
          <p className="text-slate-700">A psicoeducação é parte fundamental do seu tratamento.</p>
        </div>{' '}
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full">
          <Star className="w-4 h-4" />
          <span className="text-sm font-bold">
            ⭐ {user?.points ?? 0} / {MAX_XP} XP
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMaterials.map((item) => {
          const isRead = completedMaterialIds.has(item.id)
          return (
            <Card
              key={item.id}
              className="overflow-hidden border-slate-100 hover:shadow-lg transition-all group flex flex-col p-6 cursor-pointer relative"
              onClick={() => setReading(item)}
            >
              {isRead && (
                <Badge className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
                </Badge>
              )}
              <Badge className="w-fit mb-4 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                Semana {item.week_number}
              </Badge>
              <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2">
                📄 {item.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-3">{item.objective}</p>
              {isRead && (
                <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Material concluído
                </p>
              )}
            </Card>
          )
        })}
        {visibleMaterials.length === 0 && (
          <div className="col-span-full py-8 text-center text-slate-500">
            Nenhum material disponível no momento. Preencha seu primeiro questionário para liberar o
            conteúdo.
          </div>
        )}
      </div>

      <Dialog open={!!reading} onOpenChange={(o) => !o && setReading(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white text-slate-900">
          {reading && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="text-xl md:text-2xl text-slate-800">
                    {reading.title}
                  </DialogTitle>
                  {completedMaterialIds.has(reading.id) && (
                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
                    </Badge>
                  )}
                </div>
                <p className="text-slate-700 font-medium pt-3 pb-5 border-b border-slate-200">
                  Objetivo: {reading.objective}
                </p>
              </DialogHeader>
              <div
                className="prose prose-slate max-w-none text-sm md:text-base prose-headings:text-slate-900 prose-headings:font-bold prose-h3:text-lg prose-p:text-slate-800 prose-p:leading-relaxed prose-li:text-slate-800 prose-li:leading-relaxed prose-strong:text-slate-900 prose-a:text-amber-700 pb-8 bg-white px-1 [&_.mission-section]:not-prose [&_.phrase-section]:not-prose"
                dangerouslySetInnerHTML={{ __html: reading.content }}
              />
              {!completedMaterialIds.has(reading.id) && (
                <Button
                  onClick={() => handleMarkAsRead(reading)}
                  disabled={marking}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {marking ? 'Marcando...' : 'Marcar como lido'}
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
