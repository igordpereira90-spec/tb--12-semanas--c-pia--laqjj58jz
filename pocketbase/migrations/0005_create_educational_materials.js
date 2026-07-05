migrate(
  (app) => {
    const collection = new Collection({
      name: 'educational_materials',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'professional'",
      updateRule: "@request.auth.role = 'professional'",
      deleteRule: "@request.auth.role = 'professional'",
      fields: [
        { name: 'week_number', type: 'number', required: false, onlyInt: true, min: 0 },
        { name: 'title', type: 'text', required: true },
        { name: 'objective', type: 'text' },
        { name: 'content', type: 'editor' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_educ_materials_week ON educational_materials (week_number)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('educational_materials')
    app.delete(collection)
  },
)
