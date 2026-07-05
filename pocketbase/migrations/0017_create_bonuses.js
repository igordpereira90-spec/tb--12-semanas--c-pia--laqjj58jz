migrate(
  (app) => {
    const collection = new Collection({
      name: 'bonuses',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'professional'",
      updateRule: "@request.auth.role = 'professional'",
      deleteRule: "@request.auth.role = 'professional'",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'editor', required: true },
        { name: 'video_url', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [],
    })
    app.save(collection)

    var col = app.findCollectionByNameOrId('bonuses')

    var seeds = [
      {
        title: 'Respiração Diafragmática',
        content: '<p>Técnica de relaxamento para reduzir ansiedade e melhorar o bem-estar.</p>',
        video_url: 'https://www.youtube.com/embed/Px54tGh4Ub8',
      },
      {
        title: 'Técnicas para uma Boa Qualidade do Sono',
        content:
          '<h3>HIGIENE DO SONO</h3><p>A Higiene do Sono refere-se a um conjunto de medidas comportamentais e ambientais que visam promover a qualidade do sono. Estas recomendações ajudam a estabelecer hábitos saudáveis que facilitam o adormecer e a manutenção do sono ao longo da noite.</p><ol><li>Manter um ritmo sono-vigília regular (horários consistentes para dormir e acordar).</li><li>Crie no seu quarto um ambiente que induz ao sono (conforto, luz, ruído e temperatura adequados).</li><li>Diminuição de estímulos por parte de dispositivos eletrônicos (limitar telas emissoras de luz 1h antes de dormir).</li><li>Desenvolver atividades relaxantes antes de dormir (relaxamento, meditação, música calma).</li><li>Evitar o uso de substâncias estimulantes (evitar cafeína/nicotina após as 14h).</li><li>Evitar a ingestão de bebidas alcoólicas (o álcool altera as fases do sono).</li><li>Manter a prática de atividade física regular (evitar atividade intensa 3h antes de dormir).</li><li>Evitar refeições muito pesadas antes de dormir (refeições leves e ingestão controlada de líquidos).</li><li>Evitar resolver problemas antes de ir para a cama (deixar as preocupações do dia fora da hora de dormir).</li><li>Evitar cochilar durante o dia (garantir cansaço para o período noturno).</li></ol><h3>CONTROLE DE ESTÍMULOS</h3><p>O Controle de Estímulos trata da associação entre o quarto/cama e a dificuldade para dormir (insônia). Quando a pessoa passa muito tempo acordada na cama, o cérebro passa a associar o ambiente com frustração e vigília em vez de relaxamento e sono. Estas técnicas visam reverter essa associação.</p><ol><li>Ir para a cama apenas quando estiver sonolento.</li><li>Utilizar a cama apenas para dormir, para atividade sexual ou para recuperar-se de alguma enfermidade.</li><li>Caso não esteja sonolento ou não adormeça em até 20 minutos, sair da cama e retornar apenas quando se sentir sonolento.</li><li>Acordar e levantar-se todos os dias no mesmo horário; não cochilar durante o dia.</li></ol>',
        video_url: '',
      },
    ]

    seeds.forEach(function (s) {
      try {
        app.findFirstRecordByData('bonuses', 'title', s.title)
      } catch (_) {
        var r = new Record(col)
        r.set('title', s.title)
        r.set('content', s.content)
        r.set('video_url', s.video_url)
        app.save(r)
      }
    })
  },
  (app) => {
    try {
      var collection = app.findCollectionByNameOrId('bonuses')
      app.delete(collection)
    } catch (_) {}
  },
)
