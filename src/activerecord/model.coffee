exports.Model = class Model
  tableName: ""

  primaryIndex: 'id'
  fields: []
  adapters: ["sqlite"]

  # Relationship configuration
  _associations: {}
  hasMany: -> []
  hasOne: -> []
  belongsTo: -> []

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

  @findAll: (finder, args...) ->
    model = new @

    if typeof args[args.length - 1] is "function"
      cb = args.pop()
    else
      cb = ->

    # Require the master adapter (first in list)
    Adapter = require "#{__dirname}/adapters/#{model.adapters[0]}"
    adapter = new Adapter(model.config.get(model.adapters[0]))

    # Query the adapter
    results = adapter.read finder, 
      model.tableName(),
      args,
      {primaryIndex: model.primaryIndex},
      (rows) =>
        resultSet = []
        for row in rows
          model = new @(row, false)
          model.notify 'afterFind'
          resultSet.push model

        cb resultSet

  @toAssociationName: (plural = false) ->
    name = @name.toLowerCase()
    if plural then name + "s" else name

  constructor: (data = {}, tainted = true) ->
    @notify 'beforeInit'

    @_data = {}
    @_init_data = data
    @_dirty_data = {}
    @_is_dirty = false
    @_new = true

    for field in @fields
      do (field) =>
        # Configure the getter/setters for the model fields
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

    for type in ['hasOne', 'belongsTo', 'hasMany']
      for association in @[type]()
        if Array.isArray association
          association = association[0]

        do (association, type) =>
          assocName = association.toAssociationName(type is 'hasMany')
          @[assocName] = (cb) -> @getAssociation association, cb

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

  #
  # Relationships
  #
  hasOneExists: (model) -> @hasAssociation model, 'hasOne'
  hasManyExists: (model) -> @hasAssociation model, 'hasMany'
  belongsToExists: (model) -> @hasAssociation model, 'belongsTo'

  hasAssociation: (model, types = ['hasOne', 'hasMany', 'belongsTo']) ->
    types = [types] unless Array.isArray(types)

    for type in types
      for association in @[type]()
        if Array.isArray(association)
          return type if association[0].name is model.name
        else
          return type if association.name is model.name

    return false

  getAssociation: (model, cb) ->
    type = @hasAssociation model
    return cb(null) if type is false
    return cb(@_associations[model.name]) if @_associations[model.name]?

    config = @associationConfig model

    internalCb = (value) =>
      if type is "hasMany" and not Array.isArray(value)
        value = [value]

      @_associations[model.name] = value
      cb(value)

    if typeof @[config.loader] is "function"
      @[config.loader](internalCb)
    else if type in ["hasOne", "belongsTo"] and @hasField(config.foreignKey)
      model.find @[config.foreignKey], internalCb
    else
      internalCb(new model())

  associationConfig: (model) ->
    type = @hasAssociation model

    for assoc in @[type]
      if Array.isArray(assoc)
        config = assoc[1]
      else
        config = {}

    defaults = {}

    # Convert to model name
    assocName = model.toAssociationName(type is 'hasMany')
    assocName = assocName.charAt(0).toUpperCase() + assocName.slice(1)
    defaults.foreignKey = model.name.toLowerCase() + "_id"
    defaults.loader = "load#{assocName}"
    defaults.autoFks = true

    defaults[key] = val for own key, val of config

    return defaults

  isNew: -> @_new

  hasField: (name) -> name in @fields

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