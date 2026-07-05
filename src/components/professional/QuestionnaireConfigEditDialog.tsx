import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  upsertQuestionnaireConfig,
  type QuestionnaireConfig,
} from '@/services/questionnaire_configs'
import {
  SLIDER_FIELDS,
  FREQUENCY_FIELDS,
  CHECKBOX_FIELDS,
  SELECT_FIELDS,
  TEXTAREA_FIELDS,
} from '@/lib/questionnaire-config'
import { useToast } from '@/hooks/use-toast'
import { logAction } from '@/services/audit_logs'
import { Loader2, Save } from 'lucide-react'

interface FieldConfig {
  enabled: boolean
  label: string
  hint?: string
}

type WeekConfigs = Record<string, FieldConfig>

function buildDefaultConfigs(): WeekConfigs {
  const configs: WeekConfigs = {}
  const allFields = [
    ...SLIDER_FIELDS,
    ...CHECKBOX_FIELDS,
    ...FREQUENCY_FIELDS,
    ...SELECT_FIELDS,
    ...TEXTAREA_FIELDS,
  ]
  for (const f of allFields) {
    configs[f.name] = { enabled: true, label: f.label }
  }
  return configs
}

interface Props {
  weekNumber: number
  config: QuestionnaireConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function QuestionnaireConfigEditDialog({
  weekNumber,
  config,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const { toast } = useToast()
  const [configs, setConfigs] = useState<WeekConfigs>(buildDefaultConfigs())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const stored = config?.configs as WeekConfigs | undefined
      setConfigs(stored ? { ...buildDefaultConfigs(), ...stored } : buildDefaultConfigs())
    }
  }, [open, config])

  const updateField = (name: string, patch: Partial<FieldConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [name]: { ...prev[name], ...patch },
    }))
  }

  const enabledCount = Object.values(configs).filter((f) => f.enabled).length

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertQuestionnaireConfig(weekNumber, configs as Record<string, unknown>)
      logAction('UPDATE_QUESTIONNAIRE_CONFIG', String(weekNumber)).catch(() => {})
      toast({ title: 'Sucesso', description: 'Configuração do questionário salva com sucesso.' })
      onOpenChange(false)
      onSaved()
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar a configuração. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const renderFieldRow = (name: string, defaultLabel: string, defaultHint?: string) => (
    <div
      key={name}
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
    >
      <Switch
        checked={configs[name]?.enabled ?? true}
        onCheckedChange={(v) => updateField(name, { enabled: v })}
      />
      <div className="flex-1 space-y-2">
        <Input
          value={configs[name]?.label ?? defaultLabel}
          onChange={(e) => updateField(name, { label: e.target.value })}
          className="bg-white text-sm"
        />
        {defaultHint !== undefined && (
          <Input
            value={configs[name]?.hint ?? defaultHint}
            onChange={(e) => updateField(name, { hint: e.target.value })}
            className="bg-white text-xs text-slate-500"
            placeholder="Instrução auxiliar..."
          />
        )}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Configurar Questionário — Semana {weekNumber}
          </DialogTitle>
          <DialogDescription>
            Ative ou desative campos e personalize os rótulos das perguntas exibidas para os
            pacientes nesta semana.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">
              Campos Numéricos (0-10)
            </h3>
            <div className="space-y-3">
              {SLIDER_FIELDS.map((f) => renderFieldRow(f.name, f.label, f.hint))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">
              Campos de Múltipla Escolha
            </h3>
            <div className="space-y-3">
              {CHECKBOX_FIELDS.map((f) => renderFieldRow(f.name, f.label))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">
              Campos de Frequência
            </h3>
            <div className="space-y-3">
              {FREQUENCY_FIELDS.map((f) => renderFieldRow(f.name, f.label))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">
              Campos de Seleção
            </h3>
            <div className="space-y-3">
              {SELECT_FIELDS.map((f) => renderFieldRow(f.name, f.label))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-3">Campos de Texto</h3>
            <div className="space-y-3">
              {TEXTAREA_FIELDS.map((f) => renderFieldRow(f.name, f.label))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-slate-500">{enabledCount} campos ativos</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="min-w-32">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
