import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import {
  SLIDER_FIELDS,
  ATTENTION_SLIDER_FIELDS,
  INATTENTION_SLIDER_FIELDS,
  FREQUENCY_FIELDS,
  IMPROVEMENT_OPTIONS,
  APPETITE_OPTIONS,
  IMPAIRMENT_OPTIONS,
} from '@/lib/questionnaire-config'
import { getQuestionnaireConfigByWeek } from '@/services/questionnaire_configs'
import { getOrCreateQuestionnaireDraft, updateQuestionnaire } from '@/services/questionnaires'
import { useAutoSave } from '@/hooks/use-auto-save'
import { AutoSaveIndicator } from '@/components/patient/AutoSaveIndicator'
import { Loader2, AlertCircle, Check } from 'lucide-react'

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
  recordId?: string | null
}

const BASE_REQUIRED = [
  ...FREQUENCY_FIELDS.map((f) => f.name),
  'appetite_weight_change',
  'functional_impairment',
]

const ALWAYS_VISIBLE_FIELDS = new Set([
  'attention_score',
  'inattention_details',
  'inattention_focus',
  'inattention_listening',
  'inattention_followthrough',
  'inattention_organization',
  'inattention_mental_effort',
  'inattention_losing_things',
  'worry_freq',
  'irritability_freq',
  'muscle_tension_freq',
])

const DEBOUNCE_FIELDS = new Set([
  'specific_evolution',
  'future_expectations',
  'improvement_areas_other',
])

const WELCOME_MESSAGE = `Olá, bom dia! Vamos iniciar o nosso acompanhamento no Programa de Acompanhamento em Depressão e TDAH? O objetivo é avaliar a sua evolução ao longo do tratamento, monitorando seu humor, sono, energia, atenção e ansiedade. Suas respostas nos ajudam a personalizar seu cuidado e acelerar o seu processo de melhora. Atenciosamente, Dr. Igor`

export function QuestionnaireForm({
  week,
  onSubmit,
  initialData,
  submitLabel,
  isEditing,
  recordId,
}: Props) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [config, setConfig] = useState<WeekConfigs | null>(null)
  const draftIdRef = useRef<string | null>(recordId ?? null)

  const saveFn = useCallback(
    async (data: Record<string, unknown>) => {
      if (!user?.id) return
      const payload = { ...data, patient: user.id, week_number: week }
      if (draftIdRef.current) {
        await updateQuestionnaire(draftIdRef.current, payload)
      } else {
        const record = await getOrCreateQuestionnaireDraft(user.id, week, payload)
        draftIdRef.current = record.id
      }
    },
    [user?.id, week],
  )

  const get = (field: string, def: any) =>
    initialData && initialData[field] !== undefined && initialData[field] !== null
      ? initialData[field]
      : def

  const [form, setForm] = useState<Record<string, any>>({
    overall_feeling: get('overall_feeling', 5),
    mood_score: get('mood_score', 5),
    energy_score: get('energy_score', 5),
    sleep_score: get('sleep_score', 5),
    attention_score: get('attention_score', 5),
    inattention_details: get('inattention_details', 5),
    inattention_focus: get('inattention_focus', 5),
    inattention_listening: get('inattention_listening', 5),
    inattention_followthrough: get('inattention_followthrough', 5),
    inattention_organization: get('inattention_organization', 5),
    inattention_mental_effort: get('inattention_mental_effort', 5),
    inattention_losing_things: get('inattention_losing_things', 5),
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
    worry_freq: get('worry_freq', ''),
    irritability_freq: get('irritability_freq', ''),
    muscle_tension_freq: get('muscle_tension_freq', ''),
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

  const { status: autoSaveStatus, flush } = useAutoSave(form, {
    saveFn,
    enabled: !isEditing,
  })

  const isEnabled = (name: string) =>
    isEditing || ALWAYS_VISIBLE_FIELDS.has(name) || !config || config[name]?.enabled !== false
  const getLabel = (name: string, def: string) => config?.[name]?.label || def
  const getHint = (name: string, def: string) => config?.[name]?.hint || def

  const requiredFields = [
    ...BASE_REQUIRED.filter(isEnabled),
    ...(form.improvement_areas.includes('Outro') && isEnabled('improvement_areas')
      ? ['improvement_areas_other']
      : []),
  ]

  const update = (field: string, value: any) => {
    const newForm = { ...form, [field]: value }
    setForm(newForm)
    if (errors[field]) setErrors((p) => ({ ...p, [field]: false }))
    if (!isEditing && !DEBOUNCE_FIELDS.has(field)) {
      flush(newForm)
    }
  }

  const toggleArea = (opt: string) => {
    const cur = form.improvement_areas as string[]
    update('improvement_areas', cur.includes(opt) ? cur.filter((a) => a !== opt) : [...cur, opt])
    if (opt === 'Outro' && cur.includes('Outro')) update('improvement_areas_other', '')
  }

  const filledRequired = requiredFields.filter((f) => form[f]).length
  const progress =
    requiredFields.length > 0 ? Math.round((filledRequired / requiredFields.length) * 100) : 100

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
      if (!isEditing) {
        const saved = await flush({ ...form, week_number: week })
        if (!saved) {
          toast({ title: 'Erro', description: 'Não foi possível salvar. Verifique sua conexão.' })
          return
        }
      }
      await onSubmit({ ...form, week_number: week })
    } finally {
      setSaving(false)
    }
  }

  const renderFreqSelect = (fieldName: string, label: string, options: readonly string[]) => (
    <div key={fieldName} className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">
        {getLabel(fieldName, label)} <span className="text-red-500">*</span>
      </Label>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const isSelected = form[fieldName] === o
          return (
            <button
              key={o}
              type="button"
              onClick={() => update(fieldName, o)}
              className={cn(
                'flex items-center gap-2.5 min-h-[48px] px-4 py-2.5 rounded-xl border text-left text-sm font-medium transition-all duration-200',
                'hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5',
                isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-slate-800 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 flex-shrink-0',
                  isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white',
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <span className="leading-snug">{o}</span>
            </button>
          )
        })}
      </div>
      {errors[fieldName] && (
        <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> Obrigatório
        </p>
      )}
    </div>
  )

  const renderSlider = (f: { name: string; label: string; hint: string }) => (
    <div key={f.name} className="space-y-2">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium leading-snug">
            {getLabel(f.name, f.label)}
            {ALWAYS_VISIBLE_FIELDS.has(f.name) && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          <span className="text-xs text-slate-400 block mt-0.5">{getHint(f.name, f.hint)}</span>
        </div>
        <span className="text-sm font-bold text-primary whitespace-nowrap flex-shrink-0">
          {form[f.name]}/10
        </span>
      </div>
      <div className="py-2">
        <Slider
          value={[form[f.name]]}
          onValueChange={(v) => update(f.name, v[0])}
          max={10}
          step={1}
          className="premium-slider"
        />
      </div>
    </div>
  )

  const renderRequiredSelect = (fieldName: string, label: string, options: readonly string[]) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">
        {getLabel(fieldName, label)} <span className="text-red-500">*</span>
      </Label>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const isSelected = form[fieldName] === o
          return (
            <button
              key={o}
              type="button"
              onClick={() => update(fieldName, o)}
              className={cn(
                'flex items-center gap-2.5 min-h-[48px] px-4 py-2.5 rounded-xl border text-left text-sm font-medium transition-all duration-200',
                'hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5',
                isSelected
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-slate-800 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200 flex-shrink-0',
                  isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white',
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <span className="leading-snug">{o}</span>
            </button>
          )
        })}
      </div>
      {errors[fieldName] && (
        <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> Obrigatório
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      {!isEditing && (
        <Card className="p-4 sm:p-5 bg-gradient-to-br from-[#D4AF37]/5 to-slate-50 border-[#D4AF37]/20 premium-card">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {WELCOME_MESSAGE}
          </p>
        </Card>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Progresso do formulário</span>
          <div className="flex items-center gap-3">
            {!isEditing && <AutoSaveIndicator status={autoSaveStatus} />}
            <span className="text-sm font-bold text-[#D4AF37]">{progress}%</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {!isEditing && (
        <Card className="p-4 sm:p-5 space-y-3 premium-card">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Nome completo</Label>
            <Input value={user?.name || ''} readOnly className="bg-slate-50 min-h-[44px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input value={user?.email || ''} readOnly className="bg-slate-50 min-h-[44px]" />
          </div>
        </Card>
      )}

      <Card className="p-4 sm:p-5 space-y-4 premium-card">
        {isEnabled(SLIDER_FIELDS[0].name) && renderSlider(SLIDER_FIELDS[0])}
        {isEnabled('improvement_areas') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('improvement_areas', 'Em quais áreas você teve melhora essa semana?')}
            </Label>
            <div className="flex flex-col gap-2">
              {IMPROVEMENT_OPTIONS.map((opt) => {
                const isSelected = form.improvement_areas.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleArea(opt)}
                    className={cn(
                      'flex items-center gap-2.5 min-h-[48px] px-4 py-2.5 rounded-xl border text-left text-sm font-medium transition-all duration-200',
                      'hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5',
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-slate-800 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600',
                    )}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-200 flex-shrink-0',
                        isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-slate-300 bg-white',
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                )
              })}
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
                  className={cn('min-h-[44px]', errors.improvement_areas_other && 'border-red-400')}
                />
                {errors.improvement_areas_other && (
                  <p className="text-xs text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> Obrigatório
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

      <Card className="p-4 sm:p-5 space-y-5 premium-card">
        {FREQUENCY_FIELDS.filter((f) => isEnabled(f.name)).map((f) =>
          renderFreqSelect(f.name, f.label, f.options),
        )}
        {(isEnabled('appetite_weight_change') || isEnabled('functional_impairment')) && (
          <div className="space-y-5">
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
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-5 space-y-4 premium-card">
        {ATTENTION_SLIDER_FIELDS.filter((f) => isEnabled(f.name)).map(renderSlider)}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-500 italic">
            Avalie os itens abaixo (0 = nunca / 10 = sempre):
          </p>
          {INATTENTION_SLIDER_FIELDS.filter((f) => isEnabled(f.name)).map(renderSlider)}
        </div>
      </Card>

      {(isEnabled('specific_evolution') || isEnabled('future_expectations')) && (
        <Card className="p-4 sm:p-5 space-y-4 premium-card">
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
                className="min-h-[88px]"
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
                className="min-h-[88px]"
              />
            </div>
          )}
        </Card>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-md border-t border-[#D4AF37]/15 sm:static sm:bg-transparent sm:border-0 sm:backdrop-blur-none sm:p-0">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full min-h-[48px] premium-gradient text-base font-semibold shadow-lg sm:shadow-md"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
            </>
          ) : (
            submitLabel || 'Salvar Questionário'
          )}
        </Button>
      </div>
    </div>
  )
}
