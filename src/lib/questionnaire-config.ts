export const FREQ_OPTIONS = ['Nunca', 'Só um pouco', 'Bastante', 'Demais'] as const
export const IMPROVEMENT_OPTIONS = ['Humor', 'Energia/disposição', 'Sono', 'Ansiedade', 'Outro']
export const APPETITE_OPTIONS = [
  'Sem alteração do apetite ou peso',
  'Aumento do apetite e peso',
  'Diminuição do apetite e peso',
]
export const IMPAIRMENT_OPTIONS = [
  'Sem prejuízo significativo do seu funcionamento',
  'Prejuízo do funcionamento social',
  'Prejuízo no profissional/trabalho',
]

export const QUESTIONNAIRE_WEEKS = [0, 2, 4, 8, 10]
export const CONSULTATION_WEEKS = [6, 12]
export const ALL_WEEKS = [0, 2, 4, 6, 8, 10, 12]
export const PROGRAM_WEEKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export const SLIDER_FIELDS = [
  {
    name: 'overall_feeling',
    label: 'De 0 a 10, como está se sentindo esta semana?',
    hint: '0 = ruim / 10 = ótimo',
  },
  {
    name: 'mood_score',
    label: 'Qual a nota você daria para o seu humor essa semana?',
    hint: '0 = ruim / 10 = ótimo',
  },
  {
    name: 'energy_score',
    label: 'Qual a nota você daria para a sua energia/disposição essa semana?',
    hint: '0 = ruim / 10 = ótimo',
  },
  {
    name: 'sleep_score',
    label: 'Qual a nota você daria para o seu sono essa semana?',
    hint: '0 = ruim / 10 = ótimo',
  },
]

export const CHECKBOX_FIELDS = [
  { name: 'improvement_areas', label: 'Em quais áreas você teve melhora essa semana?' },
]

export const FREQUENCY_FIELDS = [
  { name: 'anxiety_freq', label: 'Com que frequência tem apresentado ansiedade esta semana?' },
  { name: 'insomnia_freq', label: 'Com que frequência tem apresentado insônia?' },
  { name: 'daytime_sleepiness', label: 'Com que frequência tem apresentado sonolência pelo dia?' },
  { name: 'talkativeness', label: 'Com que frequência tem ficado mais falante do que o habitual?' },
  { name: 'racing_thoughts', label: 'Com que frequência tem apresentado pensamentos acelerados?' },
  {
    name: 'increased_goal_activity',
    label:
      'Tem apresentado aumento da atividade dirigida a objetivos (seja socialmente, no trabalho, sexualmente) ou agitação psicomotora?',
  },
  {
    name: 'risky_behavior',
    label:
      'Tem apresentado envolvimento excessivo em atividades com elevado potencial para consequências dolorosas (p. ex., envolvimento em surtos desenfreados de compras, indiscrições sexuais ou investimentos financeiros insensatos)?',
  },
  { name: 'euphoria', label: 'Tem apresentado euforia a maior parte do tempo?' },
  {
    name: 'depressed_mood',
    label:
      'Tem apresentado humor deprimido na maior parte do dia, quase todos os dias, conforme indicado por relato subjetivo ou por observação feita por outras pessoas?',
  },
  {
    name: 'loss_of_interest',
    label:
      'Tem apresentado acentuada diminuição do interesse ou prazer em todas ou quase todas as atividades na maior parte do dia, quase todos os dias?',
  },
  { name: 'concentration_change', label: 'Tem apresentado alteração da concentração?' },
  { name: 'physical_activity', label: 'Tem feito atividade física essa semana?' },
]

export const SELECT_FIELDS = [
  { name: 'appetite_weight_change', label: 'Tem apresentado alteração do apetite ou do peso?' },
  {
    name: 'functional_impairment',
    label: 'Tem apresentado prejuízo importante do seu funcionamento?',
  },
]

export const TEXTAREA_FIELDS = [
  { name: 'specific_evolution', label: 'Qual evolução específica você teve essa semana?' },
  { name: 'future_expectations', label: 'O que você espera que melhore nas próximas semanas?' },
]

export const ALL_CONFIGURABLE_FIELDS = [
  ...SLIDER_FIELDS.map((f) => ({ ...f, type: 'slider' as const })),
  ...CHECKBOX_FIELDS.map((f) => ({ ...f, type: 'checkbox' as const })),
  ...FREQUENCY_FIELDS.map((f) => ({ ...f, type: 'freq' as const })),
  ...SELECT_FIELDS.map((f) => ({ ...f, type: 'select' as const })),
  ...TEXTAREA_FIELDS.map((f) => ({ ...f, type: 'textarea' as const })),
]

export const ALERT_FREQ_VALUES = ['Bastante', 'Demais']
