migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('age')) {
      col.fields.add(new NumberField({ name: 'age', min: 0, max: 150, onlyInt: true }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const ageField = col.fields.getByName('age')
    if (ageField) col.fields.remove(ageField)
    app.save(col)
  },
)
