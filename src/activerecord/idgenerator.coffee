exports.IdGenerator = class IdGenerator
  constructor: (@config) -> @initialize()
  initialize: ->
  isAsync: (method) -> @[method].length is 2