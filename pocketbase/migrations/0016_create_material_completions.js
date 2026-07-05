migrate(
  (app) => {
    const usersCollectionId = '_pb_users_auth_'
    const educMaterialsCollectionId = app.findCollectionByNameOrId('educational_materials').id

    const collection = new Collection({
      name: 'material_completions',
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
          collectionId: usersCollectionId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'material',
          type: 'relation',
          required: true,
          collectionId: educMaterialsCollectionId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_material_completions_patient ON material_completions (patient)',
        'CREATE INDEX idx_material_completions_material ON material_completions (material)',
        'CREATE UNIQUE INDEX idx_mat_completions_patient_material ON material_completions (patient, material)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('material_completions')
    app.delete(collection)
  },
)
