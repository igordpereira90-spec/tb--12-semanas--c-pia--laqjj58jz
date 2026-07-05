migrate(
  (app) => {
    const qCol = app.findCollectionByNameOrId('questionnaires')
    if (!qCol.fields.getByName('improvement_areas_other')) {
      qCol.fields.add(new TextField({ name: 'improvement_areas_other' }))
    }
    app.save(qCol)

    const unlockCol = new Collection({
      name: 'patient_unlocks',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')",
      viewRule:
        "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')",
      createRule: "@request.auth.role = 'professional'",
      updateRule: "@request.auth.role = 'professional'",
      deleteRule: "@request.auth.role = 'professional'",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'week_number', type: 'number', onlyInt: true, min: 0, max: 12 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_patient_unlocks_patient_week ON patient_unlocks (patient, week_number)',
      ],
    })
    app.save(unlockCol)
  },
  (app) => {
    try {
      const qCol = app.findCollectionByNameOrId('questionnaires')
      const field = qCol.fields.getByName('improvement_areas_other')
      if (field) qCol.fields.remove(field)
      app.save(qCol)
    } catch (_) {}
    try {
      const col = app.findCollectionByNameOrId('patient_unlocks')
      app.delete(col)
    } catch (_) {}
  },
)
