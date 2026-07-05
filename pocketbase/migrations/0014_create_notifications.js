migrate(
  (app) => {
    const usersCollectionId = '_pb_users_auth_'

    const collection = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && recipient = @request.auth.id",
      viewRule: "@request.auth.id != '' && recipient = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && recipient = @request.auth.id",
      deleteRule: "@request.auth.id != '' && recipient = @request.auth.id",
      fields: [
        {
          name: 'recipient',
          type: 'relation',
          required: true,
          collectionId: usersCollectionId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'message', type: 'text' },
        { name: 'read', type: 'bool' },
        {
          name: 'type',
          type: 'select',
          values: ['info', 'success', 'alert'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_recipient ON notifications (recipient)',
        'CREATE INDEX idx_notifications_created ON notifications (created DESC)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('notifications')
    app.delete(collection)
  },
)
