exports.Model = class Model
  tableName: ""

  _init_data: {}
  _data: {}
  _dirty_data: {}
  _is_dirty: false
  _new: true

  primaryIndex: 'id'
  fields: []
  adapters: ["sqlite"]

  @find: (args...) ->
    if arguments.length < 1 or arguments[0] is null
      return new @

    # Use findAll's logic
    if typeof args[args.length - 1] is "function"
      cb = args.pop()
    else
      cb = ->

    finished = (results) -> cb(results[0])
    args.push finished

    result = @findAll.apply @, args

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
      (rows) =>
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
        @_data[field] = @_init_data[field]
      else
        @_data[field] = null

    if tainted
      @_dirty_data = @_init_data
      @_is_dirty = true

    @notify 'afterInit'

  save: (cb = ->) ->
    return cb(true) unless @notify 'beforeSave'
    return cb() unless @_is_dirty

    if @isNew()
      @notify "beforeCreate"
    else
      @notify "beforeUpdate"

    return cb(true) unless @isValid()

    # TODO: ID generation middleware

    primaryIndex = @_init_data[@primaryIndex]

    for adapter in @adapters
      Adapter = require "#{__dirname}/adapters/#{adapter}"
      adapter = new Adapter(@config.get(adapter))
      adapter.write primaryIndex, 
        @tableName(), 
        @_dirty_data,
        @isNew(),
        {primaryIndex: @primaryIndex},
        (results) =>
          return cb(true) if results is null

          @_data[@primaryIndex] = results.lastID if @isNew()
          @_init_data[@primaryIndex] = results.lastID

          if @isNew()
            @notify "afterCreate"
          else
            @notify "afterUpdate"

          @_dirty_data = {}
          @_saved = true
          @_new = false

          @notify "afterSave"
          cb()

  delete: (cb) ->
    return cb(true) unless @notify 'beforeDelete'

    for adapter in @adapters
      Adapter = require "#{__dirname}/adapters/#{adapter}"
      adapter = new Adapter(@config.get(adapter))
      adapter.delete @_data[@primaryIndex],
        @tableName(),
        {primaryIndex: @primaryIndex},
        (result) =>
          return cb(true) if result is null

          @_data = {}
          @_dirty_data = {}
          @_data[field] = null for field in @fields

          @notify 'afterDelete'
          cb()

  isNew: -> @_new

  tableName: ->
    return @table if @table
    return @__proto__.constructor.name.toLowerCase() + "s"

  toJSON: -> @_data

  # In the future, this will be used to support notifying plugins
  notify: (event) -> @[event]()

  # Callbacks. Override these.
  isValid: -> true
  beforeInit: ->
  afterInit: ->
  afterFind: ->
  beforeSave: -> true
  beforeCreate: ->
  beforeUpdate: ->
  afterCreate: ->
  afterUpdate: ->
  afterSave: ->
  beforeDelete: -> true
  afterDelete: ->