onRecordAfterDeleteSuccess((e) => {
  try {
    const col = $app.findCollectionByNameOrId('audit_logs')
    const log = new Record(col)
    log.set('actor', e.record.getString('patient'))
    log.set('action', 'DELETE_QUESTIONNAIRE')
    log.set('resource_id', e.record.id)
    log.set('metadata', JSON.stringify({ week_number: e.record.getInt('week_number') }))
    $app.saveNoValidate(log)
  } catch (err) {
    $app.logger().error('audit log delete error', 'error', err.message)
  }
  return e.next()
}, 'questionnaires')
