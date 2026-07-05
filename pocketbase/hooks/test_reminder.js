routerAdd(
  'POST',
  '/backend/v1/test-reminder',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) return e.unauthorizedError('Authentication required')

    const role = auth.getString('role') || ''
    if (role !== 'professional') {
      return e.forbiddenError('Only professionals can trigger test reminders')
    }

    const body = e.requestInfo().body || {}
    const targetWeek = body.week !== undefined ? parseInt(body.week, 10) : null

    var patients = []
    try {
      patients = $app.findRecordsByFilter('users', "role = 'patient'", 'created', 0, 0)
    } catch (err) {
      return e.json(500, { error: 'Failed to fetch patients: ' + err.message })
    }

    const notifCol = $app.findCollectionByNameOrId('notifications')
    var now = new Date()
    var twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    var twentyFourHoursAgoStr = twentyFourHoursAgo
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d+Z$/, '')

    var results = { checked: 0, remindersCreated: 0, skipped: 0, details: [] }

    for (var i = 0; i < patients.length; i++) {
      var patient = patients[i]
      results.checked++

      var weekToCheck = targetWeek
      if (weekToCheck === null) {
        var createdStr = patient.getString('created')
        if (!createdStr) {
          results.skipped++
          continue
        }
        var createdDate = new Date(createdStr)
        var daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        weekToCheck = Math.floor(daysDiff / 7)
        if (weekToCheck < 0 || weekToCheck > 12) {
          results.skipped++
          continue
        }
      }

      var hasQuestionnaire = false
      try {
        var records = $app.findRecordsByFilter(
          'questionnaires',
          'patient = "' + patient.id + '" && week_number = ' + weekToCheck,
          '',
          1,
          0,
        )
        hasQuestionnaire = records.length > 0
      } catch (_) {}

      if (hasQuestionnaire) {
        results.skipped++
        continue
      }

      var reminderTitle = 'Lembrete de Questionário'
      var reminderMessage =
        'Você tem um novo questionário disponível para a semana ' +
        weekToCheck +
        '. Por favor, preencha-o para continuar seu acompanhamento.'

      var alreadyReminded = false
      try {
        var recentNotifs = $app.findRecordsByFilter(
          'notifications',
          'recipient = "' +
            patient.id +
            '" && title = "' +
            reminderTitle +
            '" && created > "' +
            twentyFourHoursAgoStr +
            '"',
          '',
          1,
          0,
        )
        alreadyReminded = recentNotifs.length > 0
      } catch (_) {}

      if (alreadyReminded) {
        results.skipped++
        results.details.push({
          patient: patient.getString('name') || patient.id,
          week: weekToCheck,
          status: 'duplicate_skipped',
        })
        continue
      }

      try {
        var notif = new Record(notifCol)
        notif.set('recipient', patient.id)
        notif.set('title', reminderTitle)
        notif.set('message', reminderMessage)
        notif.set('read', false)
        notif.set('type', 'alert')
        $app.saveNoValidate(notif)
        results.remindersCreated++
        results.details.push({
          patient: patient.getString('name') || patient.id,
          week: weekToCheck,
          status: 'reminder_created',
        })
      } catch (err) {
        results.details.push({
          patient: patient.getString('name') || patient.id,
          week: weekToCheck,
          status: 'error: ' + err.message,
        })
      }
    }

    return e.json(200, results)
  },
  $apis.requireAuth(),
)
