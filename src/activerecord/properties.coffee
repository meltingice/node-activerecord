{Inflection} = require './support/inflection'

module.exports = 
  createProperties: ->
    for field in [@primaryKey].concat(@fields) then do (field) =>
      Object.defineProperty @, field,
        enumerable: true
        configurable: false
        get: -> @readAttribute(field)
        set: (val) ->
          # We don't allow the primary index to be set via
          # accessor method.
          return if field is @primaryKey
          if @readAttribute(field) isnt val
            val = @applyAttributeFilter(field, val)
            @writeAttribute(field, val)
            @dirtyKeys[field] = true

  readAttribute: (attr) -> @data[attr]
  writeAttribute: (attr, value) ->
    @data[attr] = value
    @executeAttributeEvent(attr, value)

  dirtyAttributes: (includePrimary = false) ->
    return {} unless @isDirty()

    data = {}
    if includePrimary
      data[@primaryKey] = @readAttribute(@primaryKey)
    
    for own key, dirty of @dirtyKeys
      continue unless dirty
      data[key] = @readAttribute(key)

    return data

  isDirty: -> Object.keys(@dirtyKeys).length > 0

  applyAttributeFilter: (field, val) ->
    filterFunc = "filter#{Inflection.camelize(field)}"
    result = @notifyObserver filterFunc
    if result is false then val else result

  executeAttributeEvent: (attr, val) ->
    func = "set#{Inflection.camelize(attr)}"
    @notifyObserver func, val

  notifyObserver: (func, args...) ->
    return false unless @[func]?
    @[func].apply @, args
