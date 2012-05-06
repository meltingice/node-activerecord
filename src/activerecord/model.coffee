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
    return if arguments.length < 1 or arguments[0] is null

    # Use findAll's logic
    if typeof args[args.length - 1] is "function"
      cb = args.pop()
    else
      cb = ->

    finished = (results) => 
      if results.length is 0
        cb(new @)
      else
        cb(results[0])

    args.push finished

    @findAll.apply @, args

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
    @_initData = data
    @_dirtyData = {}
    @_isDirty = false
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
              @_dirtyData[field] = val
              @_isDirty = true

          enumerable: true
          configurable: true

      if @_initData[field]
        @_data[field] = @_initData[field]
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
      @_dirtyData = @_initData
      @_isDirty = true

    @notify 'afterInit'

  save: (cb = ->) ->
    return cb(true) unless @notify 'beforeSave'
    return cb() unless @_isDirty

    if @isNew()
      @notify "beforeCreate"
    else
      @notify "beforeUpdate"

    return cb(true) unless @isValid()

    # TODO: ID generation middleware

    primaryIndex = @_initData[@primaryIndex]

    for adapter in @adapters
      Adapter = require "#{__dirname}/adapters/#{adapter}"
      adapter = new Adapter(@config.get(adapter))
      adapter.write primaryIndex, 
        @tableName(), 
        @_dirtyData,
        @isNew(),
        {primaryIndex: @primaryIndex},
        (results) =>
          return cb(true) if results is null

          @_data[@primaryIndex] = results.lastID if @isNew()
          @_initData[@primaryIndex] = results.lastID

          if @isNew()
            @notify "afterCreate"
          else
            @notify "afterUpdate"

          @_dirtyData = {}
          @_isDirty = false
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
          @_dirtyData = {}
          @_isDirty = false
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
  isLoaded: -> not @isNew()
  isDirty: -> @_isDirty

  hasField: (name) -> name in @fields

  tableName: ->
    return @table if @table
    return @__proto__.constructor.name.toLowerCase() + "s"

  toJSON: -> @_data

  # In the future, this will be used to support notifying plugins as well
  notify: (event) ->
    result = @[event]()
    result and @["_#{event}"]()

  # Internal callbacks. Don't override these.
  _isValid: -> true
  _beforeInit: -> true
  _afterInit: -> true
  _afterFind: -> @_new = false; true
  _beforeSave: -> true
  _beforeCreate: -> true
  _beforeUpdate: -> true
  _afterCreate: -> true
  _afterUpdate: -> true
  _afterSave: -> true
  _beforeDelete: -> true
  _afterDelete: -> true

  # Callbacks. Override these.
  isValid: -> true
  beforeInit: -> true
  afterInit: -> true
  afterFind: -> true
  beforeSave: -> true
  beforeCreate: -> true
  beforeUpdate: -> true
  afterCreate: -> true
  afterUpdate: -> true
  afterSave: -> true
  beforeDelete: -> true
  afterDelete: -> true