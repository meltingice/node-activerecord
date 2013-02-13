exports.Adapter = class Adapter
  constructor: (@config) -> @initialize()
  initialize: ->
  isAsync: (method) -> @[method].length is 2

  # CRUD
  create: ->
  read: ->
  update: ->
  delete: ->
  touch: ->