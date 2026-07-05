migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('consent_accepted')) {
      col.fields.add(new BoolField({ name: 'consent_accepted' }))
    }
    if (!col.fields.getByName('consent_date')) {
      col.fields.add(new DateField({ name: 'consent_date' }))
    }
    app.save(col)

    const users = app.findRecordsByFilter('_pb_users_auth_', '', '', 0, 0)
    for (const user of users) {
      let changed = false
      if (user.get('consent_accepted') === null || user.get('consent_accepted') === undefined) {
        user.set('consent_accepted', false)
        changed = true
      }
      if (changed) app.saveNoValidate(user)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const f1 = col.fields.getByName('consent_accepted')
    if (f1) col.fields.remove(f1)
    const f2 = col.fields.getByName('consent_date')
    if (f2) col.fields.remove(f2)
    app.save(col)
  },
)
