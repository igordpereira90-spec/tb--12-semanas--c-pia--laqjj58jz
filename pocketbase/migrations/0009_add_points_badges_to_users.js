migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!col.fields.getByName('points')) {
      col.fields.add(new NumberField({ name: 'points', min: 0, onlyInt: true }))
    }
    if (!col.fields.getByName('badges')) {
      col.fields.add(new JSONField({ name: 'badges', maxSize: 5242880 }))
    }
    app.save(col)

    const users = app.findRecordsByFilter('_pb_users_auth_', '', '', 0, 0)
    for (const user of users) {
      let changed = false
      if (user.get('points') === null || user.get('points') === undefined) {
        user.set('points', 0)
        changed = true
      }
      const badges = user.get('badges')
      if (badges === null || badges === undefined || badges === '') {
        user.set('badges', JSON.stringify({ earnedBadges: [], readMaterials: [] }))
        changed = true
      }
      if (changed) app.saveNoValidate(user)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    const pointsField = col.fields.getByName('points')
    if (pointsField) col.fields.remove(pointsField)
    const badgesField = col.fields.getByName('badges')
    if (badgesField) col.fields.remove(badgesField)
    app.save(col)
  },
)
