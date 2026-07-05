migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('questionnaires')

    var insomniaField = col.fields.getByName('insomnia_freq')
    if (insomniaField) {
      insomniaField.values = [
        'Nunca',
        'Só um pouco',
        'Bastante',
        'Demais',
        'Redução da necessidade de sono (p. ex., sente-se descansado com apenas 3 horas de sono)',
      ]
    }

    var newSelectFields = [
      { name: 'worry_freq', values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'] },
      { name: 'irritability_freq', values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'] },
      { name: 'muscle_tension_freq', values: ['Nunca', 'Só um pouco', 'Bastante', 'Demais'] },
    ]

    newSelectFields.forEach(function (sf) {
      if (!col.fields.getByName(sf.name)) {
        col.fields.add(new SelectField({ name: sf.name, values: sf.values, maxSelect: 1 }))
      }
    })

    var newNumberFields = [
      'attention_score',
      'inattention_details',
      'inattention_focus',
      'inattention_listening',
      'inattention_followthrough',
      'inattention_organization',
      'inattention_mental_effort',
      'inattention_losing_things',
    ]

    newNumberFields.forEach(function (name) {
      if (!col.fields.getByName(name)) {
        col.fields.add(new NumberField({ name: name }))
      }
    })

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('questionnaires')

    var insomniaField = col.fields.getByName('insomnia_freq')
    if (insomniaField) {
      insomniaField.values = ['Nunca', 'Só um pouco', 'Bastante', 'Demais']
    }

    var fieldsToRemove = [
      'worry_freq',
      'irritability_freq',
      'muscle_tension_freq',
      'attention_score',
      'inattention_details',
      'inattention_focus',
      'inattention_listening',
      'inattention_followthrough',
      'inattention_organization',
      'inattention_mental_effort',
      'inattention_losing_things',
    ]

    fieldsToRemove.forEach(function (name) {
      var f = col.fields.getByName(name)
      if (f) col.fields.remove(f)
    })

    app.save(col)
  },
)
