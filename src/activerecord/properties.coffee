{Inflection} = require './support/inflection'

module.exports =
  # Creates all of the model properties as defined in the fields
  # Because we need to know when a property is modified, we use
  # setters.
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

          # Only set this model as dirty if the new value is different
          if @readAttribute(field) isnt val
            val = @applyAttributeFilter(field, val)
            @writeAttribute(field, val)
            @dirtyKeys[field] = true

  # Directly read the data for the given attribute
  readAttribute: (attr) -> @data[attr] || null

  # Directly write data to a given attribute, bypassing any attribute filters.
  # Attribute events are still fired.
  writeAttribute: (attr, value, dirty = true) ->
    @data[attr] = value
    # @dirtyKeys[attr] = true if dirty?
    @executeAttributeEvent(attr, value)

  # Returns an object representing every attribute that has changed, and it's
  # new value. Does not include the primary ID by default.
  dirtyAttributes: (includePrimary = false) ->
    return {} unless @isDirty()

    data = {}
    if includePrimary
      data[@primaryKey] = @readAttribute(@primaryKey)

    for own key, dirty of @dirtyKeys
      continue unless dirty
      data[key] = @readAttribute(key)

    return data

  # Does this model have any dirty keys?
  isDirty: -> Object.keys(@dirtyKeys).length > 0

  # Applies an attribute filter to the given attribute. Can be used to mutate
  # the attribute value before setting it. It looks for `filter{Name}` functions,
  # where {Name} is a camelized version of the attribute name.
  applyAttributeFilter: (field, val) ->
    filterFunc = "filter#{Inflection.camelize(field)}"
    result = @notifyObserver filterFunc
    if result is false then val else result

  # Executes an attribute event. These are called after the attribute is set, and
  # are not used to mutate the value in any way. They are simply used as event callbacks.
  # In more robust languages like Ruby, we would simply overwrite the attributes
  # getter/setter, but we have to work around that a bit in Javascript.
  executeAttributeEvent: (attr, val) ->
    func = "set#{Inflection.camelize(attr)}"
    @notifyObserver func, val

  notifyObserver: (func, args...) ->
    return false unless @[func]?
    @[func].apply @, args
