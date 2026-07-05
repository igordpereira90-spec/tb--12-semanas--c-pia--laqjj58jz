migrate(
  (app) => {
    const collection = new Collection({
      name: 'audit_logs',
      type: 'base',
      listRule: "@request.auth.role = 'professional'",
      viewRule: "@request.auth.role = 'professional'",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'actor',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'action', type: 'text', required: true },
        { name: 'resource_id', type: 'text' },
        { name: 'metadata', type: 'json', maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_audit_logs_actor ON audit_logs (actor)',
        'CREATE INDEX idx_audit_logs_created ON audit_logs (created DESC)',
        'CREATE INDEX idx_audit_logs_action ON audit_logs (action)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('audit_logs')
    app.delete(collection)
  },
)
