migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    usersCol.listRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.role = 'professional')"
    usersCol.viewRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.role = 'professional')"
    usersCol.createRule = ''
    usersCol.updateRule = 'id = @request.auth.id'
    usersCol.deleteRule = 'id = @request.auth.id'
    app.save(usersCol)

    const qCol = app.findCollectionByNameOrId('questionnaires')
    qCol.listRule =
      "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')"
    qCol.viewRule =
      "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')"
    qCol.createRule = "@request.auth.id != '' && patient = @request.auth.id"
    qCol.updateRule = "@request.auth.id != '' && patient = @request.auth.id"
    qCol.deleteRule = "@request.auth.id != '' && patient = @request.auth.id"
    app.save(qCol)

    const emCol = app.findCollectionByNameOrId('educational_materials')
    emCol.listRule = "@request.auth.id != ''"
    emCol.viewRule = "@request.auth.id != ''"
    emCol.createRule = "@request.auth.role = 'professional'"
    emCol.updateRule = "@request.auth.role = 'professional'"
    emCol.deleteRule = "@request.auth.role = 'professional'"
    app.save(emCol)

    const puCol = app.findCollectionByNameOrId('patient_unlocks')
    puCol.listRule =
      "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')"
    puCol.viewRule =
      "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'professional')"
    puCol.createRule = "@request.auth.role = 'professional'"
    puCol.updateRule = "@request.auth.role = 'professional'"
    puCol.deleteRule = "@request.auth.role = 'professional'"
    app.save(puCol)

    const qcCol = app.findCollectionByNameOrId('questionnaire_configs')
    qcCol.listRule = "@request.auth.id != ''"
    qcCol.viewRule = "@request.auth.id != ''"
    qcCol.createRule = "@request.auth.role = 'professional'"
    qcCol.updateRule = "@request.auth.role = 'professional'"
    qcCol.deleteRule = "@request.auth.role = 'professional'"
    app.save(qcCol)

    const alCol = app.findCollectionByNameOrId('audit_logs')
    alCol.listRule = "@request.auth.role = 'professional'"
    alCol.viewRule = "@request.auth.role = 'professional'"
    alCol.createRule = "@request.auth.id != ''"
    alCol.updateRule = null
    alCol.deleteRule = null
    app.save(alCol)
  },
  (app) => {
    // Rules revert — original rules were equivalent
  },
)
