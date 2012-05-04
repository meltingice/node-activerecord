exports.Model = class Model
  tableName: ""
  _init_data: {}
  _dirty_data: {}
  _data: {}

  primaryIndex: 'id'
  fields: []
  adapters: ["sqlite"]

  @find: ->
    if arguments.length < 1 or arguments[0] is null
      return new @

    # Use findAll's logic
    result = @findAll.apply @, Array.prototype.slice.call(arguments, 0)

    return new @ if result.length is 0
    return result[0]

  @findAll: (finder, cb = ->) ->
    model = new @

    # Require the master adapter (first in list)
    Adapter = require "#{__dirname}/adapters/#{model.adapters[0]}"
    adapter = new Adapter(model.config.get(model.adapters[0]))

    # Query the adapter
    results = adapter.read finder, 
      model.tableName(),
      Array.prototype.slice.call(arguments, 0),
      {primaryIndex: model.primaryIndex},
      (rows) ->
        resultSet = []
        for row in rows
          model = new @(row, false)
          model.notify 'afterFind'
          resultSet.push model

        cb resultSet

  constructor: (data = {}, tainted = true) ->
    @notify 'beforeInit'

    @_init_data = data

    for field in @fields
      do (field) =>
        # Need to stick this in a closure in order to keep the field
        # property the right value.
        Object.defineProperty @, field,
          get: -> @_data[field]
          set: (val) ->
            if @_data[field] isnt val
              filterFunc = "filter" + field.charAt(0).toUpperCase() + field.slice(1)
              if @[filterFunc]? and typeof @[filterFunc] is "function"
                val = @[filterFunc](val)

              @_data[field] = val
              @_dirty_data[field] = val

          enumerable: true
          configurable: true

      if @_init_data[field]
        @[field] = @_init_data[field]
      else
        @[field] = null

    @notify 'afterInit'

  tableName: ->
    return @table if @table
    return @__proto__.constructor.name.toLowerCase() + "s"

  # In the future, this will be used to support notifying plugins
  notify: (event) -> @[event]()

  # Callbacks. Override these.
  beforeInit: ->
  afterInit: ->