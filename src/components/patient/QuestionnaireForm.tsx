import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  SLIDER_FIELDS,
  FREQUENCY_FIELDS,
  FREQ_OPTIONS,
  IMPROVEMENT_OPTIONS,
  APPETITE_OPTIONS,
  IMPAIRMENT_OPTIONS,
} from '@/lib/questionnaire-config'
import { getQuestionnaireConfigByWeek } from '@/services/questionnaire_configs'
import { Loader2, AlertCircle } from 'lucide-react'

interface FieldConfig {
  enabled: boolean
  label: string
  hint?: string
}
type WeekConfigs = Record<string, FieldConfig>

interface Props {
  week: number
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  initialData?: Record<string, unknown>
  submitLabel?: string
  isEditing?: boolean
}

const BASE_REQUIRED = [
  ...FREQUENCY_FIELDS.map((f) => f.name),
  'appetite_weight_change',
  'functional_impairment',
]

export function QuestionnaireForm({ week, onSubmit, initialData, submitLabel, isEditing }: Props) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [config, setConfig] = useState<WeekConfigs | null>(null)

  const get = (field: string, def: any) =>
    initialData && initialData[field] !== undefined && initialData[field] !== null
      ? initialData[field]
      : def

  const [form, setForm] = useState<Record<string, any>>({
    overall_feeling: get('overall_feeling', 5),
    mood_score: get('mood_score', 5),
    energy_score: get('energy_score', 5),
    sleep_score: get('sleep_score', 5),
    improvement_areas: Array.isArray(get('improvement_areas', []))
      ? get('improvement_areas', [])
      : [],
    improvement_areas_other: get('improvement_areas_other', ''),
    anxiety_freq: get('anxiety_freq', ''),
    insomnia_freq: get('insomnia_freq', ''),
    daytime_sleepiness: get('daytime_sleepiness', ''),
    talkativeness: get('talkativeness', ''),
    racing_thoughts: get('racing_thoughts', ''),
    increased_goal_activity: get('increased_goal_activity', ''),
    risky_behavior: get('risky_behavior', ''),
    euphoria: get('euphoria', ''),
    depressed_mood: get('depressed_mood', ''),
    loss_of_interest: get('loss_of_interest', ''),
    concentration_change: get('concentration_change', ''),
    physical_activity: get('physical_activity', ''),
    appetite_weight_change: get('appetite_weight_change', ''),
    functional_impairment: get('functional_impairment', ''),
    specific_evolution: get('specific_evolution', ''),
    future_expectations: get('future_expectations', ''),
  })

  useEffect(() => {
    if (isEditing) return
    getQuestionnaireConfigByWeek(week)
      .then((c) => setConfig((c?.configs as WeekConfigs) || null))
      .catch(() => setConfig(null))
  }, [week, isEditing])

  const isEnabled = (name: string) => isEditing || !config || config[name]?.enabled !== false
  const getLabel = (name: string, def: string) => config?.[name]?.label || def
  const getHint = (name: string, def: string) => config?.[name]?.hint || def

  const requiredFields = [
    ...BASE_REQUIRED.filter(isEnabled),
    ...(form.improvement_areas.includes('Outro') && isEnabled('improvement_areas')
      ? ['improvement_areas_other']
      : []),
  ]

  const update = (field: string, value: any) => {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: false }))
  }

  const toggleArea = (opt: string) => {
    const cur = form.improvement_areas as string[]
    update('improvement_areas', cur.includes(opt) ? cur.filter((a) => a !== opt) : [...cur, opt])
    if (opt === 'Outro' && cur.includes('Outro')) {
      update('improvement_areas_other', '')
    }
  }

  const filledRequired = requiredFields.filter((f) => form[f]).length
  const progress = Math.round((filledRequired / requiredFields.length) * 100)

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {}
    requiredFields.forEach((f) => {
      if (!form[f]) newErrors[f] = true
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos obrigatórios.' })
      return
    }
    setSaving(true)
    try {
      await onSubmit({ ...form, week_number: week })
    } finally {
      setSaving(false)
    }
  }

  const renderFreqSelect = (fieldName: string, label: string) => (
    <div key={fieldName} className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {getLabel(fieldName, label)} <span className="text-red-500">*</span>
      </Label>
      <Select value={form[fieldName]} onValueChange={(v) => update(fieldName, v)}>
        <SelectTrigger className={cn('h-10', errors[fieldName] && 'border-red-400')}>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {FREQ_OPTIONS.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[fieldName] && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Obrigatório
        </p>
      )}
    </div>
  )

  const renderSlider = (f: { name: string; label: string; hint: string }) => (
    <div key={f.name} className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <Label className="text-sm font-medium">{getLabel(f.name, f.label)}</Label>
          <span className="text-xs text-slate-400 block">{getHint(f.name, f.hint)}</span>
        </div>
        <span className="text-sm font-bold text-primary">{form[f.name]}/10</span>
      </div>
      <Slider
        value={[form[f.name]]}
        onValueChange={(v) => update(f.name, v[0])}
        max={10}
        step={1}
      />
    </div>
  )

  const renderRequiredSelect = (fieldName: string, label: string, options: readonly string[]) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {getLabel(fieldName, label)} <span className="text-red-500">*</span>
      </Label>
      <Select value={form[fieldName]} onValueChange={(v) => update(fieldName, v)}>
        <SelectTrigger className={cn('h-10', errors[fieldName] && 'border-red-400')}>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[fieldName] && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Obrigatório
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Progresso do formulário</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {!isEditing && (
        <Card className="p-5 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Nome completo</Label>
            <Input value={user?.name || ''} readOnly className="bg-slate-50" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input value={user?.email || ''} readOnly className="bg-slate-50" />
          </div>
        </Card>
      )}

      <Card className="p-5 space-y-4">
        {isEnabled(SLIDER_FIELDS[0].name) && renderSlider(SLIDER_FIELDS[0])}
        {isEnabled('improvement_areas') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('improvement_areas', 'Em quais áreas você teve melhora essa semana?')}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {IMPROVEMENT_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.improvement_areas.includes(opt)}
                    onCheckedChange={() => toggleArea(opt)}
                  />
                  <Label className="text-sm cursor-pointer" onClick={() => toggleArea(opt)}>
                    {opt}
                  </Label>
                </div>
              ))}
            </div>
            {form.improvement_areas.includes('Outro') && (
              <div className="space-y-1.5 mt-2">
                <Label className="text-sm font-medium text-slate-700">
                  Especifique a outra área <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.improvement_areas_other}
                  onChange={(e) => update('improvement_areas_other', e.target.value)}
                  placeholder="Descreva a área de melhora..."
                  className={cn(errors.improvement_areas_other && 'border-red-400')}
                />
                {errors.improvement_areas_other && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Obrigatório
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        {SLIDER_FIELDS.slice(1)
          .filter((f) => isEnabled(f.name))
          .map(renderSlider)}
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Sintomas e Frequência</h3>
        {FREQUENCY_FIELDS.filter((f) => isEnabled(f.name)).map((f) =>
          renderFreqSelect(f.name, f.label),
        )}
      </Card>

      {(isEnabled('appetite_weight_change') || isEnabled('functional_impairment')) && (
        <Card className="p-5 space-y-4">
          {isEnabled('appetite_weight_change') &&
            renderRequiredSelect(
              'appetite_weight_change',
              'Tem apresentado alteração do apetite ou do peso?',
              APPETITE_OPTIONS,
            )}
          {isEnabled('functional_impairment') &&
            renderRequiredSelect(
              'functional_impairment',
              'Tem apresentado prejuízo importante do seu funcionamento?',
              IMPAIRMENT_OPTIONS,
            )}
        </Card>
      )}

      {(isEnabled('specific_evolution') || isEnabled('future_expectations')) && (
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Evolução e Expectativas</h3>
          {isEnabled('specific_evolution') && (
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {getLabel('specific_evolution', 'Qual evolução específica você teve essa semana?')}
              </Label>
              <Textarea
                value={form.specific_evolution}
                onChange={(e) => update('specific_evolution', e.target.value)}
                placeholder="Descreva sua evolução..."
                className="min-h-[80px]"
              />
            </div>
          )}
          {isEnabled('future_expectations') && (
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {getLabel(
                  'future_expectations',
                  'O que você espera que melhore nas próximas semanas?',
                )}
              </Label>
              <Textarea
                value={form.future_expectations}
                onChange={(e) => update('future_expectations', e.target.value)}
                placeholder="Descreva suas expectativas..."
                className="min-h-[80px]"
              />
            </div>
          )}
        </Card>
      )}

      <Button onClick={handleSubmit} disabled={saving} className="w-full" size="lg">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
          </>
        ) : (
          submitLabel || 'Salvar Questionário'
        )}
      </Button>
    </div>
  )
}
