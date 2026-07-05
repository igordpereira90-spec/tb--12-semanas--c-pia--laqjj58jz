migrate(
  (app) => {
    const collection = new Collection({
      name: 'questionnaire_configs',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'professional'",
      updateRule: "@request.auth.role = 'professional'",
      deleteRule: "@request.auth.role = 'professional'",
      fields: [
        { name: 'week_number', type: 'number', onlyInt: true, min: 0, max: 12 },
        { name: 'configs', type: 'json', maxSize: 1048576 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_questionnaire_configs_week ON questionnaire_configs (week_number)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('questionnaire_configs')
    app.delete(collection)
  },
)
