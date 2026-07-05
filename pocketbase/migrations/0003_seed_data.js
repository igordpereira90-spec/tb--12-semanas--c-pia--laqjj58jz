migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const qCol = app.findCollectionByNameOrId('questionnaires')

    function createUser(email, name, role) {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', email)
        return null
      } catch (_) {}
      const r = new Record(usersCol)
      r.setEmail(email)
      r.setPassword('Skip@Pass')
      r.setVerified(true)
      r.set('name', name)
      r.set('role', role)
      app.save(r)
      return r
    }

    function createQ(pid, week, d) {
      try {
        app.findFirstRecordByData('questionnaires', 'week_number', week)
      } catch (_) {}
      const r = new Record(qCol)
      r.set('patient', pid)
      r.set('week_number', week)
      r.set('overall_feeling', d.of || 5)
      r.set('improvement_areas', d.ia || [])
      r.set('mood_score', d.ms || 5)
      r.set('energy_score', d.es || 5)
      r.set('sleep_score', d.ss || 5)
      var freqs = [
        'anxiety_freq',
        'insomnia_freq',
        'daytime_sleepiness',
        'talkativeness',
        'racing_thoughts',
        'increased_goal_activity',
        'risky_behavior',
        'euphoria',
        'depressed_mood',
        'loss_of_interest',
        'concentration_change',
        'physical_activity',
      ]
      for (var i = 0; i < freqs.length; i++) {
        r.set(freqs[i], d.f && d.f[freqs[i]] ? d.f[freqs[i]] : 'Nunca')
      }
      r.set('appetite_weight_change', d.awc || 'Sem alteração')
      r.set('functional_impairment', d.fi || 'Sem prejuízo')
      r.set('specific_evolution', d.se || '')
      r.set('future_expectations', d.fe || '')
      app.save(r)
    }

    createUser('igordpereira90@gmail.com', 'Dr. Igor Pereira', 'professional')
    var p1 = createUser('rafael@example.com', 'Rafael Costa', 'patient')
    var p2 = createUser('maria@example.com', 'Maria Souza', 'patient')
    var p3 = createUser('joao@example.com', 'João Silva', 'patient')

    if (p1) {
      createQ(p1.id, 0, {
        of: 4,
        ms: 4,
        es: 5,
        ss: 3,
        ia: ['Humor', 'Sono', 'Ansiedade'],
        f: {
          anxiety_freq: 'Bastante',
          insomnia_freq: 'Bastante',
          depressed_mood: 'Bastante',
          loss_of_interest: 'Bastante',
          concentration_change: 'Só um pouco',
          risky_behavior: 'Só um pouco',
        },
        awc: 'Aumento',
        fi: 'Social',
        se: 'Início do tratamento com sintomas depressivos e ansiosos.',
        fe: 'Espero melhorar o sono e o humor.',
      })
      createQ(p1.id, 2, {
        of: 6,
        ms: 6,
        es: 6,
        ss: 5,
        ia: ['Humor', 'Energia'],
        f: {
          anxiety_freq: 'Só um pouco',
          insomnia_freq: 'Só um pouco',
          depressed_mood: 'Só um pouco',
          loss_of_interest: 'Só um pouco',
          increased_goal_activity: 'Só um pouco',
          physical_activity: 'Só um pouco',
        },
        se: 'Melhora significativa do humor e redução da ansiedade.',
        fe: 'Continuar melhorando.',
      })
      createQ(p1.id, 4, {
        of: 5,
        ms: 5,
        es: 8,
        ss: 4,
        ia: ['Energia', 'Sono'],
        f: {
          anxiety_freq: 'Só um pouco',
          insomnia_freq: 'Bastante',
          daytime_sleepiness: 'Bastante',
          talkativeness: 'Bastante',
          racing_thoughts: 'Bastante',
          increased_goal_activity: 'Bastante',
          risky_behavior: 'Bastante',
          euphoria: 'Bastante',
          physical_activity: 'Bastante',
          concentration_change: 'Só um pouco',
        },
        awc: 'Aumento',
        fi: 'Profissional',
        se: 'Aumento importante de energia e euforia, prejudicando sono e concentração.',
        fe: 'Ajuste de medicação previsto para próxima consulta.',
      })
    }

    if (p2) {
      createQ(p2.id, 0, {
        of: 5,
        ms: 5,
        es: 5,
        ss: 6,
        ia: ['Sono'],
        f: { anxiety_freq: 'Só um pouco', insomnia_freq: 'Só um pouco' },
        se: 'Quadro inicial moderado, com queixa principal de sono.',
        fe: 'Desejo regular melhor o sono.',
      })
      createQ(p2.id, 2, {
        of: 6,
        ms: 6,
        es: 6,
        ss: 7,
        ia: ['Humor'],
        f: { anxiety_freq: 'Só um pouco' },
        se: 'Melhora gradual do humor e sono.',
        fe: 'Continuar assim.',
      })
      createQ(p2.id, 4, {
        of: 7,
        ms: 7,
        es: 6,
        ss: 7,
        ia: [],
        se: 'Evolução favorável, sem queixas significativas.',
        fe: 'Sinto-me bem.',
      })
      createQ(p2.id, 8, {
        of: 8,
        ms: 8,
        es: 7,
        ss: 8,
        ia: [],
        se: 'Estabilidade clínica mantida.',
        fe: 'Manter o equilíbrio.',
      })
    }

    if (p3) {
      createQ(p3.id, 0, {
        of: 4,
        ms: 4,
        es: 4,
        ss: 5,
        ia: ['Humor', 'Energia', 'Ansiedade'],
        f: {
          anxiety_freq: 'Bastante',
          insomnia_freq: 'Só um pouco',
          depressed_mood: 'Bastante',
          loss_of_interest: 'Só um pouco',
          concentration_change: 'Só um pouco',
        },
        se: 'Início do acompanhamento com humor deprimido e ansiedade.',
        fe: 'Espero ter mais energia.',
      })
      createQ(p3.id, 2, {
        of: 5,
        ms: 5,
        es: 5,
        ss: 6,
        ia: ['Humor'],
        f: { anxiety_freq: 'Só um pouco', depressed_mood: 'Só um pouco' },
        se: 'Leve melhora do humor e redução da ansiedade.',
        fe: 'Continuar evoluindo.',
      })
    }
  },
  (app) => {
    var emails = [
      'igordpereira90@gmail.com',
      'rafael@example.com',
      'maria@example.com',
      'joao@example.com',
    ]
    for (var i = 0; i < emails.length; i++) {
      try {
        app.delete(app.findAuthRecordByEmail('_pb_users_auth_', emails[i]))
      } catch (_) {}
    }
    try {
      app.truncateCollection(app.findCollectionByNameOrId('questionnaires'))
    } catch (_) {}
  },
)
