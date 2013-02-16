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