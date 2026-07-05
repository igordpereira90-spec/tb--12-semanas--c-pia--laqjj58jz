migrate(
  (app) => {
    const usersCollectionId = '_pb_users_auth_'

    const collection = new Collection({
      name: 'professional_notes',
      type: 'base',
      listRule: "@request.auth.role = 'professional'",
      viewRule: "@request.auth.role = 'professional'",
      createRule: "@request.auth.role = 'professional'",
      updateRule: "@request.auth.role = 'professional'",
      deleteRule: "@request.auth.role = 'professional'",
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
          name: 'professional',
          type: 'relation',
          required: true,
          collectionId: usersCollectionId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_prof_notes_patient ON professional_notes (patient)',
        'CREATE INDEX idx_prof_notes_professional ON professional_notes (professional)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('professional_notes')
    app.delete(collection)
  },
)
