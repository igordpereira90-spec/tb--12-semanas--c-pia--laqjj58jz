migrate(
  (app) => {
    const collection = new Collection({
      name: 'questionnaires',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')",
      viewRule:
        "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')",
      createRule: "@request.auth.id != '' && patient = @request.auth.id",
      updateRule: "@request.auth.id != '' && patient = @request.auth.id",
      deleteRule: "@request.auth.id != '' && patient = @request.auth.id",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'week_number', type: 'number', onlyInt: true },
        { name: 'overall_feeling', type: 'number', min: 0, max: 10, onlyInt: true },
        {
          name: 'improvement_areas',
          type: 'select',
          values: ['Humor', 'Energia', 'Sono', 'Ansiedade', 'Outro'],
          maxSelect: 5,
        },
        { name: 'mood_score', type: 'number', min: 0, max: 10, onlyInt: true },
        { name: 'energy_score', type: 'number', min: 0, max: 10, onlyInt: true },
        { name: 'sleep_score', type: 'number', min: 0, max: 10, onlyInt: true },
        {
          name: 'anxiety_freq',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'insomnia_freq',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'daytime_sleepiness',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'talkativeness',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'racing_thoughts',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'increased_goal_activity',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'risky_behavior',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'euphoria',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'depressed_mood',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'loss_of_interest',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'concentration_change',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'physical_activity',
          type: 'select',
          values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'],
          maxSelect: 1,
        },
        {
          name: 'appetite_weight_change',
          type: 'select',
          values: ['Sem alteração', 'Aumento', 'Diminuição'],
          maxSelect: 1,
        },
        {
          name: 'functional_impairment',
          type: 'select',
          values: ['Sem prejuízo', 'Social', 'Profissional'],
          maxSelect: 1,
        },
        { name: 'specific_evolution', type: 'text' },
        { name: 'future_expectations', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_questionnaires_patient_week ON questionnaires (patient, week_number)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('questionnaires')
    app.delete(collection)
  },
)
