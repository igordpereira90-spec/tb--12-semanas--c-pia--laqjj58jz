routerAdd(
  'POST',
  '/backend/v1/patient-summary',
  (e) => {
    const body = e.requestInfo().body || {}
    const patientId = body.patient_id
    if (!patientId) return e.badRequestError('patient_id is required')

    let records = []
    try {
      records = $app.findRecordsByFilter(
        'questionnaires',
        'patient = "' + patientId + '"',
        'week_number',
        100,
        0,
      )
    } catch (err) {
      return e.json(200, { summary: 'Sem dados disponíveis para análise.' })
    }

    if (records.length === 0) {
      return e.json(200, { summary: 'Sem dados disponíveis para análise.' })
    }

    const dataPoints = records
      .map(function (r) {
        var parts = [
          'Semana ' + r.getInt('week_number'),
          'Humor=' + r.getInt('mood_score'),
          'Energia=' + r.getInt('energy_score'),
          'Sono=' + r.getInt('sleep_score'),
          'Sensacao=' + r.getInt('overall_feeling'),
          'Ansiedade=' + r.getString('anxiety_freq'),
          'Insonia=' + r.getString('insomnia_freq'),
          'Euforia=' + r.getString('euphoria'),
          'Deprimido=' + r.getString('depressed_mood'),
          'Risco=' + r.getString('risky_behavior'),
        ]
        var evo = r.getString('specific_evolution')
        if (evo) parts.push('Evolucao: ' + evo)
        var exp = r.getString('future_expectations')
        if (exp) parts.push('Expectativas: ' + exp)
        return parts.join(', ')
      })
      .join('\n')

    const systemPrompt =
      'Voce e um assistente clinico especializado em analise de dados de pacientes com Transtorno Bipolar. Gere resumos concisos, objetivos e profissionais em portugues brasileiro. Destaque tendencias, mudancas entre semanas especificas e pontos de atencao clinica.'

    const userPrompt =
      'Analise a evolucao do paciente ao longo do programa de 12 semanas. Gere um resumo conciso (maximo 3 frases) destacando:\n1. Tendencias gerais (melhora, piora, estabilidade)\n2. Mudancas especificas entre semanas (mencione os numeros das semanas)\n3. Pontos de atencao clinica\n\nDados dos questionarios:\n' +
      dataPoints

    try {
      const reply = $ai.chat({
        model: 'fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })
      return e.json(200, { summary: reply.choices[0].message.content })
    } catch (err) {
      if (err instanceof SkipAiConfigError) {
        return e.json(503, { error: 'IA temporariamente indisponivel' })
      }
      if (err instanceof SkipAiError) {
        return e.json(502, { error: 'IA temporariamente indisponivel' })
      }
      return e.json(500, { error: 'Erro ao gerar resumo' })
    }
  },
  $apis.requireAuth(),
)
