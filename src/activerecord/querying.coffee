array = require 'array.js'

exports.static =
  # Search by primary IDs
  # If given an array of ID(s), the response will
  # also be an array.
  find: (search, cb = ->) ->
    if Array.isArray(search)
      type = 'multi'
    else if typeof search is "object"
      type = 'where'
    else
      type = 'single'
      search = [search]

    adapter = @getAdapter()

    opts =
      query: search
      table: @tableName()
      primaryKey: @::primaryKey

    adapter.read opts, (err, results) =>
      @queryCallback(err, results, type, cb)

  all: (cb = ->) ->
    adapter = @getAdapter()
    opts =
      query: null
      table: @tableName()
      primaryKey: @::primaryKey
      scope: 'all'

    adapter.read opts, (err, results) =>
      @queryCallback(err, results, 'multi', cb)

  getAdapter: ->
    unless @adapter?
      if typeof @::adapter is "object"
        config = @::config.get @::adapter.adapterName
        @adapter = new @::adapter(config)
      else if typeof @::adapter is "string"
        adapter = require "./adapters/#{@::adapter}"
        config = @::config.get adapter.adapterName
        @adapter = new adapter(config)

    return @adapter

  getIdGenerator: ->
    unless @idGenerator?
      if typeof @::idGenerator is "object"
        config = @::config.get('idGenerators')[@::idGenerator.generatorName]
        @idGenerator = new @::idGenerator(config)
      else if typeof @::idGenerator is "string"
        idGenerator = require "./id-generators/#{@::idGenerator}"
        config = @::config.get('idGenerators')[idGenerator.generatorName]
        @idGenerator = new idGenerator(config)
      else
        return false # ID generation performed by adapter

    return @idGenerator

  queryCallback: (err, results, type, cb) ->
    models = array()
    for result in results
      model =  new @(result, false)
      model.notify 'afterFind'
      models.push model

    models = models.first() if type is 'single'
    cb(err, models)

exports.members = 
  save: (cb = ->) ->
    return cb(null) unless @isDirty or @isNew

    @notify 'beforeSave'
    if @isNew
      @notify 'beforeCreate'
    else
      @notify 'beforeUpdate'

    idGen = @constructor.getIdGenerator()
    if @isNew and idGen and idGen.type is 'pre'
      opts =
        data: @data
        table: @tableName()
        primaryKey: @primaryKey

      idGen.generate opts, (err, id) =>
        return false if err
        @writeAttribute @primaryKey, id
        @performSave(cb)
    else
      @performSave(cb)

  performSave: (cb) ->
    adapter = @constructor.getAdapter()

    if @isNew
      opts =
        data: @data
        table: @tableName()
        id: @data[@primaryKey]
        primaryKey: @primaryKey

      adapter.create opts, (err, result) =>
        @saveFinished(err, result, cb)
    else
      opts =
        data: @data # TODO, only dirty keys
        table: @tableName()

      adapter.update opts, (err, result) =>
        @safeFinished(err, result, cb)

  saveFinished: (err, result, cb) ->
    @isNew = false
    cb()
