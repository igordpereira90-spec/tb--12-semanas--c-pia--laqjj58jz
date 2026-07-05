routerAdd(
  'POST',
  '/backend/v1/ai-summary',
  (e) => {
    const body = e.requestInfo().body || {}
    const patientId = body.patient_id
    if (!patientId) return e.badRequestError('patient_id is required')

    const records = $app.findRecordsByFilter(
      'questionnaires',
      'patient = "' + patientId + '"',
      'week_number',
      100,
      0,
    )

    if (records.length === 0) {
      return e.json(200, { summary: 'Sem dados disponiveis para analise.' })
    }

    const dataPoints = records
      .map(function (r) {
        var lines = []
        lines.push('Semana ' + r.getInt('week_number') + ':')
        lines.push('  - Sensacao Geral: ' + r.getInt('overall_feeling'))
        lines.push('  - Humor: ' + r.getInt('mood_score'))
        lines.push('  - Energia: ' + r.getInt('energy_score'))
        lines.push('  - Sono: ' + r.getInt('sleep_score'))
        lines.push('  - Ansiedade: ' + r.getString('anxiety_freq'))
        lines.push('  - Insonia: ' + r.getString('insomnia_freq'))
        lines.push('  - Comportamento de risco: ' + r.getString('risky_behavior'))
        lines.push('  - Euforia: ' + r.getString('euphoria'))
        lines.push('  - Humor deprimido: ' + r.getString('depressed_mood'))
        lines.push('  - Perda de interesse: ' + r.getString('loss_of_interest'))
        lines.push('  - Evolucao especifica: ' + (r.getString('specific_evolution') || 'N/A'))
        return lines.join('\n')
      })
      .join('\n\n')

    var systemPrompt =
      'Voce e um assistente clinico especializado em Transtorno Bipolar. Analise dados de questionarios preenchidos por pacientes e gere resumos concisos em portugues, destacando tendencias e mencionando semanas especificas.'

    var userPrompt =
      'Abaixo estao os dados dos questionarios de um paciente com Transtorno Bipolar, organizados por semana:\n\n' +
      dataPoints +
      "\n\nGere um resumo clinico conciso (maximo 3-4 frases) destacando:\n1. Tendencias gerais (melhora, piora ou estabilidade) em humor, sono, energia e sensacao geral\n2. Flutuacoes significativas entre semanas especificas (mencione os numeros das semanas)\n3. Alertas clinicos importantes (se houver)\n\nExemplos: 'Melhora consistente no sono desde a Semana 4' ou 'Flutuacoes de humor observadas entre as Semanas 4 e 8'. Responda em portugues."

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
        return e.json(502, { error: 'Falha ao gerar resumo com IA' })
      }
      return e.json(500, { error: 'Erro interno ao gerar resumo' })
    }
  },
  $apis.requireAuth(),
)
