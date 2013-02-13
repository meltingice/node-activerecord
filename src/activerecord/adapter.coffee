exports.Adapter = class Adapter
  # Does this adapter require ID pre-generation?
  idPreGeneration: false

  constructor: (@config) -> @initialize()
  initialize: ->
  isAsync: (method) -> @[method].length is 2

  # CRUD
  create: ->
  read: ->
  update: ->
  delete: ->
  touch: ->