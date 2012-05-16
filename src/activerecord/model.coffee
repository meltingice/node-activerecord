exports.Model = class Model
  tableName: ""

  primaryIndex: 'id'
  idMiddleware: 'sql' # default
  idMiddlewareOptions: {}

  fields: []
  adapters: ["sqlite"]

  # Relationship configuration
  _associations: {}
  hasMany: -> []
  hasOne: -> []
  belongsTo: -> []

  # Since the JSON plugin is so commonly used, we include it by
  # default.
  plugins: -> [
    require(__dirname + "/plugins/json")
  ]

  @find: (args...) ->
    return if arguments.length < 1 or arguments[0] is null

    # Use findAll's logic
    if typeof args[args.length - 1] is "function"
      cb = args.pop()
    else
      cb = ->

    finished = (err, results) => 
      if results.length is 0
        cb(err, new @)
      else
        cb(err, results[0])

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
      (err, rows) =>
        cb(err, rows) if err

        resultSet = []
        for row in rows
          model = new @(row, false)
          model.notify 'afterFind'
          resultSet.push model

        cb null, resultSet

  @toAssociationName: (plural = false) ->
    name = @name.toLowerCase()
    if plural then name + "s" else name

  constructor: (data = {}, tainted = true) ->
    @_data = {}
    @_initData = data
    @_dirtyData = {}
    @_isDirty = false
    @_new = true

    # Plugin system
    @pluginCache = []
    @extend @plugins()

    @notify 'beforeInit'

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
    return cb(null) unless @_isDirty

    @notify 'beforeSave', (res) =>
      cb(null) unless res
    
      if @isNew()
        @notify "beforeCreate"
      else
        @notify "beforeUpdate"

      return cb(true) unless @isValid()

      if @isNew() and @idMiddleware?
        middleware = require "#{__dirname}/middleware/#{@idMiddleware}"
        mConfig = @config.get('middleware')
        if mConfig?[@idMiddleware]
          mOpts = mConfig[@idMiddleware]
        else
          mOpts = {}

        m = new middleware(mOpts)

      preID = (err, id) =>
        if id isnt null
          @_data[@primaryIndex] = id
          @_initData[@primaryIndex] = id

        primaryIndex = @_initData[@primaryIndex]

        for adapter in @adapters
          Adapter = require "#{__dirname}/adapters/#{adapter}"
          adapter = new Adapter(@config.get(adapter))
          adapter.write primaryIndex, 
            @tableName(), 
            @_dirtyData,
            @isNew(),
            {primaryIndex: @primaryIndex},
            (err, results) =>
              return cb(err) if err

              if @isNew() and @idMiddleware? and middleware.supports.afterWrite
                m.afterWrite @idMiddlewareOptions, results, (err, id) =>
                  postID(err, id, results)
              else
                postID(null, null, results)

      postID = (err, id, results) =>
        @_data[@primaryIndex] = id if id isnt null
        @_initData[@primaryIndex] = @_data[@primaryIndex]

        if @isNew()
          @notify "afterCreate"
        else
          @notify "afterUpdate"

        @_dirtyData = {}
        @_isDirty = false
        @_saved = true
        @_new = false

        @notify "afterSave", => cb(null)

      if @isNew() and @idMiddleware? and middleware.supports.beforeWrite
        m.beforeWrite @idMiddlewareOptions, preID
      else
        preID(null, null)

  delete: (cb) ->
    return cb(true) unless @notify 'beforeDelete'

    for adapter in @adapters
      Adapter = require "#{__dirname}/adapters/#{adapter}"
      adapter = new Adapter(@config.get(adapter))
      adapter.delete @_data[@primaryIndex],
        @tableName(),
        {primaryIndex: @primaryIndex},
        (err, result) =>
          return cb(err) if err

          @_data = {}
          @_dirtyData = {}
          @_isDirty = false
          @_data[field] = null for field in @fields

          @notify 'afterDelete'
          cb(null, result)

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
    return cb(null, @_associations[model.name]) if @_associations[model.name]?

    config = @associationConfig model

    internalCb = (err, value) =>
      return cb(err, value) if err

      if type is "hasMany" and not Array.isArray(value)
        value = [value]

      @_associations[model.name] = value
      cb(null, value)

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

  saveBelongsToAssociations: (cb) ->
    cb(true) if @belongsTo().length is 0

    doneCount = 0
    done = => 
      doneCount++
      cb(true) if doneCount is @belongsTo().length

    for belongsTo in @belongsTo()
      unless @_associations[belongsTo.name]
        done(); continue

      obj = @_associations[belongsTo.name]
      obj.save (err) =>
        config = @associationConfig(belongsTo)

        if @hasField config.foreignKey
          @_data[config.foreignKey] = obj[obj.primaryIndex]

        done()

  saveHasSomeAssociations: (cb) ->
    cb(true) if @hasOne().length is 0 and @hasMany().length is 0

    finishCount = @hasOne().length
    for hasMany in @hasMany()
      if @_associations[hasMany.name]
        finishCount += @_associations[hasMany.name].length
      else
        finishCount++

    doneCount = 0
    done = =>
      doneCount++
      cb(true) if doneCount is finishCount

    for hasOne in @hasOne()
      unless @_associations[hasOne.name]
        done(); continue

      obj = @_associations[hasOne.name]
      obj.save (err) =>
        config = @associationConfig(hasOne)

        if @hasField config.foreignKey
          @_data[config.foreignKey] = obj[obj.primaryIndex]

        done()

    for hasMany in @hasMany()
      unless @_associations[hasMany.name]
        done(); continue

      for obj in @_associations[hasMany.name]
        obj.save (err) =>
          config = @associationConfig hasMany

          if @hasField config.foreignKey
            obj[config.foreignKey] = @[@primaryIndex]

          done()

  isNew: -> @_new
  isLoaded: -> not @isNew()
  isDirty: -> @_isDirty

  hasField: (name) -> name in @fields

  tableName: ->
    return @table if @table
    return @__proto__.constructor.name.toLowerCase() + "s"

  # Extends this model with new functionality. The base of the plugin system.
  # In the ES.next future, we can drop directly extending the Model object and
  # instead use proxies to send requests to fully separate Plugin objects.
  #
  # Note that this does not allow you to override any of the existing functions
  # in the Model object.
  extend: (src) ->
    src = [src] unless Array.isArray(src)

    for copy in src
      for own prop of copy::
        continue if prop is "constructor"
        @[prop] = copy::[prop] unless @[prop]

      @pluginCache.push new copy(@)

  # In the future, this will be used to support notifying plugins as well
  notify: (event, cb = null) ->
    if cb
      # async
      @[event] (result1) =>
        @["_#{event}"] (result2) =>
          result = result1 and result2
          for plugin in @pluginCache
            result = result and plugin[event]()

          cb(result)
    else
      # sync
      result = @[event]() and @["_#{event}"]()
      for plugin in @pluginCache
        result = result and plugin[event]()

  # Internal callbacks. Don't override these.
  _isValid: -> true
  _beforeInit: -> true
  _afterInit: -> true
  _afterFind: -> @_new = false; true
  _beforeSave: (c) -> @saveBelongsToAssociations(c)
  _beforeCreate: -> true
  _beforeUpdate: -> true
  _afterCreate: -> true
  _afterUpdate: -> true
  _afterSave: (c) -> @saveHasSomeAssociations(c)
  _beforeDelete: -> true
  _afterDelete: -> true

  # Callbacks. Override these.
  isValid: -> true
  beforeInit: -> true
  afterInit: -> true
  afterFind: -> true
  beforeSave: (c) -> c(true)
  beforeCreate: -> true
  beforeUpdate: -> true
  afterCreate: -> true
  afterUpdate: -> true
  afterSave: (c) -> c(true)
  beforeDelete: -> true
  afterDelete: -> true