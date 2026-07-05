onRecordAfterCreateSuccess((e) => {
  const patientId = e.record.getString('patient')
  if (!patientId) return e.next()

  try {
    const user = $app.findRecordById('users', patientId)
    const weekNum = e.record.getInt('week_number')

    var scheduledWeeks = [0, 2, 4, 6, 8, 10, 12]
    var weekBasePoints = {
      0: 100,
      2: 110,
      4: 120,
      6: 135,
      8: 145,
      10: 155,
      12: 170,
    }

    var basePoints = weekBasePoints[weekNum] || 100

    var streakBonus = 0
    var sIdx = scheduledWeeks.indexOf(weekNum)
    if (sIdx > 0) {
      var prevWeek = scheduledWeeks[sIdx - 1]
      var prevRecords = $app.findRecordsByFilter(
        'questionnaires',
        'patient = "' + patientId + '" && week_number = ' + prevWeek,
        '',
        1,
        0,
      )
      if (prevRecords.length > 0) {
        streakBonus = 5
      }
    }

    var totalAwarded = basePoints + streakBonus

    let points = user.getInt('points') || 0
    points += totalAwarded

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

    const questionnaires = $app.findRecordsByFilter(
      'questionnaires',
      'patient = "' + patientId + '"',
      'week_number',
      0,
      0,
    )
    const qCount = questionnaires.length

    if (weekNum === 0 && badges.earnedBadges.indexOf('first_milestone') === -1) {
      badges.earnedBadges.push('first_milestone')
    }
    if (qCount >= 3 && badges.earnedBadges.indexOf('consistency_champion') === -1) {
      badges.earnedBadges.push('consistency_champion')
    }
    if (qCount >= 4 && badges.earnedBadges.indexOf('halfway_hero') === -1) {
      badges.earnedBadges.push('halfway_hero')
    }
    if (qCount >= 7 && badges.earnedBadges.indexOf('completion_master') === -1) {
      badges.earnedBadges.push('completion_master')
    }
    if (
      badges.readMaterials.length >= 3 &&
      badges.earnedBadges.indexOf('knowledge_seeker') === -1
    ) {
      badges.earnedBadges.push('knowledge_seeker')
    }

    user.set('points', points)
    user.set('badges', JSON.stringify(badges))
    $app.saveNoValidate(user)

    try {
      var professionals = $app.findRecordsByFilter('users', "role = 'professional'", '', 0, 0)
      var notifCol = $app.findCollectionByNameOrId('notifications')
      var patientName = user.getString('name') || 'Paciente'
      for (var i = 0; i < professionals.length; i++) {
        var notif = new Record(notifCol)
        notif.set('recipient', professionals[i].id)
        notif.set('title', 'Novo questionário preenchido')
        notif.set(
          'message',
          'Paciente ' + patientName + ' completou o questionário da Semana ' + weekNum,
        )
        notif.set('read', false)
        notif.set('type', 'info')
        $app.saveNoValidate(notif)
      }
    } catch (notifErr) {
      $app.logger().error('notification creation error', 'error', notifErr.message)
    }
  } catch (err) {
    $app.logger().error('gamification hook error', 'error', err.message)
  }

  return e.next()
}, 'questionnaires')
