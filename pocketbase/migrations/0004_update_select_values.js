migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('questionnaires')

    const improvementField = col.fields.find((f) => f.name === 'improvement_areas')
    improvementField.values = ['Humor', 'Energia/disposição', 'Sono', 'Ansiedade', 'Outro']

    const appetiteField = col.fields.find((f) => f.name === 'appetite_weight_change')
    appetiteField.values = [
      'Sem alteração do apetite ou peso',
      'Aumento do apetite e peso',
      'Diminuição do apetite e peso',
    ]

    const functionalField = col.fields.find((f) => f.name === 'functional_impairment')
    functionalField.values = [
      'Sem prejuízo significativo do seu funcionamento',
      'Prejuízo do funcionamento social',
      'Prejuízo no profissional/trabalho',
    ]

    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET appetite_weight_change = 'Sem alteração do apetite ou peso' WHERE appetite_weight_change = 'Sem alteração'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET appetite_weight_change = 'Aumento do apetite e peso' WHERE appetite_weight_change = 'Aumento'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET appetite_weight_change = 'Diminuição do apetite e peso' WHERE appetite_weight_change = 'Diminuição'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET functional_impairment = 'Sem prejuízo significativo do seu funcionamento' WHERE functional_impairment = 'Sem prejuízo'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET functional_impairment = 'Prejuízo do funcionamento social' WHERE functional_impairment = 'Social'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE questionnaires SET functional_impairment = 'Prejuízo no profissional/trabalho' WHERE functional_impairment = 'Profissional'",
      )
      .execute()
    app
      .db()
      .newQuery(
        'UPDATE questionnaires SET improvement_areas = REPLACE(improvement_areas, \'"Energia"\', \'"Energia/disposição"\') WHERE improvement_areas LIKE \'%"Energia"%\'',
      )
      .execute()
  },
  (app) => {},
)
