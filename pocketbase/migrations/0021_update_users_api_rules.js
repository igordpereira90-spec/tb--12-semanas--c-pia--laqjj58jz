migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.updateRule =
      "id = @request.auth.id || (@request.auth.role = 'professional' && role = 'patient')"
    col.deleteRule =
      "id = @request.auth.id || (@request.auth.role = 'professional' && role = 'patient')"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.updateRule = 'id = @request.auth.id'
    col.deleteRule = 'id = @request.auth.id'
    app.save(col)
  },
)
