routerAdd(
  'POST',
  '/backend/v1/audit/log',
  (e) => {
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    const body = e.requestInfo().body || {}
    if (!body.action || !String(body.action).trim()) return e.badRequestError('action is required')

    try {
      const col = $app.findCollectionByNameOrId('audit_logs')
      const log = new Record(col)
      log.set('actor', userId)
      log.set('action', String(body.action))
      log.set('resource_id', body.resource_id || '')
      var meta = body.metadata || {}
      if (typeof meta !== 'string') meta = JSON.stringify(meta)
      log.set('metadata', meta)
      $app.saveNoValidate(log)
      return e.json(201, { success: true })
    } catch (err) {
      $app.logger().error('audit log action error', 'error', err.message)
      return e.json(500, { error: 'Failed to create audit log' })
    }
  },
  $apis.requireAuth(),
)
