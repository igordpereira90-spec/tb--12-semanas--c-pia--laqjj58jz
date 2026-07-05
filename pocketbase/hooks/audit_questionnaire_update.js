onRecordAfterUpdateSuccess((e) => {
  try {
    const col = $app.findCollectionByNameOrId('audit_logs')
    const log = new Record(col)
    log.set('actor', e.record.getString('patient'))
    log.set('action', 'UPDATE_QUESTIONNAIRE')
    log.set('resource_id', e.record.id)
    var changes = {}
    var fields = [
      'overall_feeling',
      'mood_score',
      'energy_score',
      'sleep_score',
      'specific_evolution',
      'future_expectations',
    ]
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i]
      var oldVal = e.record.original().getString(f)
      var newVal = e.record.getString(f)
      if (oldVal !== newVal) changes[f] = { from: oldVal, to: newVal }
    }
    log.set(
      'metadata',
      JSON.stringify({ week_number: e.record.getInt('week_number'), changes: changes }),
    )
    $app.saveNoValidate(log)
  } catch (err) {
    $app.logger().error('audit log update error', 'error', err.message)
  }
  return e.next()
}, 'questionnaires')
