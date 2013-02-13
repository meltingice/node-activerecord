exports.Result = class Result extends Array
  constructor: ->
    super()
    @createAccessors()

  createAccessors: ->
    Object.defineProperty @, 'first',
      enumerable: false
      configurable: false
      get: -> if @length then @[0] else null

    Object.defineProperty @, 'last',
      enumerable: false
      configurable: false
      get: -> if @length then @[@length - 1] else null