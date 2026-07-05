routerAdd(
  'POST',
  '/backend/v1/read-material',
  (e) => {
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    const body = e.requestInfo().body || {}
    const materialId = body.materialId
    if (!materialId) return e.badRequestError('materialId is required')

    try {
      const user = $app.findRecordById('users', userId)

      let badgesRaw = user.get('badges')
      let badges
      if (typeof badgesRaw === 'string') {
        try {
          badges = JSON.parse(badgesRaw)
        } catch (_) {
          badges = { earnedBadges: [], readMaterials: [] }
        }
      } else if (badgesRaw && typeof badgesRaw === 'object') {
        badges = JSON.parse(JSON.stringify(badgesRaw))
      } else {
        badges = { earnedBadges: [], readMaterials: [] }
      }
      if (!Array.isArray(badges.earnedBadges)) badges.earnedBadges = []
      if (!Array.isArray(badges.readMaterials)) badges.readMaterials = []

      let points = user.getInt('points') || 0
      let alreadyRead = badges.readMaterials.indexOf(materialId) !== -1

      if (!alreadyRead) {
        badges.readMaterials.push(materialId)
        points += 5

        if (
          badges.readMaterials.length >= 3 &&
          badges.earnedBadges.indexOf('knowledge_seeker') === -1
        ) {
          badges.earnedBadges.push('knowledge_seeker')
        }

        user.set('points', points)
        user.set('badges', JSON.stringify(badges))
        $app.saveNoValidate(user)
      }

      return e.json(200, { points: points, alreadyRead: alreadyRead })
    } catch (err) {
      $app.logger().error('record material read error', 'error', err.message)
      return e.json(500, { error: 'Failed to record material read' })
    }
  },
  $apis.requireAuth(),
)
