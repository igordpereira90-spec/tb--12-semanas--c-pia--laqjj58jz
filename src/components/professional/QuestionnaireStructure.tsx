import { useState, useEffect, useCallback } from 'react'
import { getQuestionnaireConfigs, type QuestionnaireConfig } from '@/services/questionnaire_configs'
import { QuestionnaireConfigEditDialog } from '@/components/professional/QuestionnaireConfigEditDialog'
import { useRealtime } from '@/hooks/use-realtime'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings2, Loader2, CheckCircle2, PlusCircle, SlidersHorizontal } from 'lucide-react'

const PROGRAM_WEEKS = Array.from({ length: 13 }, (_, i) => i)

export function QuestionnaireStructure() {
  const [configs, setConfigs] = useState<QuestionnaireConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingWeek, setEditingWeek] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getQuestionnaireConfigs()
      setConfigs(data)
    } catch {
      setConfigs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('questionnaire_configs', () => {
    load()
  })

  const getConfig = (week: number) => configs.find((c) => c.week_number === week) || null

  const editingConfig = editingWeek !== null ? getConfig(editingWeek) : null
  const configuredCount = configs.length

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-800">Estrutura do Questionário</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-primary">{configuredCount}</span>
          <span className="text-slate-500">de {PROGRAM_WEEKS.length} configuradas</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {PROGRAM_WEEKS.map((week) => {
          const config = getConfig(week)
          const hasConfig = !!config
          const fieldCount = config?.configs
            ? Object.values(config.configs).filter(
                (f) => f && typeof f === 'object' && (f as { enabled?: boolean }).enabled,
              ).length
            : 0
          return (
            <Card
              key={week}
              className="p-4 hover:shadow-md transition-shadow duration-200 border-primary/10 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{week}</span>
                  </div>
                  <span className="text-xs text-slate-400 uppercase">Semana</span>
                </div>
                {hasConfig ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {fieldCount}
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
                    <PlusCircle className="w-3 h-3 mr-1" /> Pendente
                  </Badge>
                )}
              </div>
              <Button
                variant={hasConfig ? 'outline' : 'default'}
                size="sm"
                className="w-full"
                onClick={() => setEditingWeek(week)}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                {hasConfig ? 'Editar' : 'Configurar'}
              </Button>
            </Card>
          )
        })}
      </div>

      <QuestionnaireConfigEditDialog
        weekNumber={editingWeek ?? 0}
        config={editingConfig}
        open={editingWeek !== null}
        onOpenChange={(o) => {
          if (!o) setEditingWeek(null)
        }}
        onSaved={load}
      />
    </div>
  )
}
