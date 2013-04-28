# Responsible for proxying data between the core library and
# the database. Should implement standard CRUD.
exports.Adapter = class Adapter
  idGeneration:
    pre: false
    post: true

  constructor: (@config) -> @initialize()
  initialize: ->

  # CRUD
  create: ->
  read: ->
  update: ->
  delete: ->
  touch: ->