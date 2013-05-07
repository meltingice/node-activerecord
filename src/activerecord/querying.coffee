{Query} = require './query'

# We proxy calls to these methods over to the Query module
proxyMethods = ['find', 'all', 'first', 'last', 'limit']

exports.static =
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

  # TODO: This method is not referenced anymore. Obsolete?
  queryCallback: (err, results, type, cb) ->
    models = array()
    for result in results
      model =  new @(result, false)
      model.notify 'afterFind'
      models.push model

    models = models.first() if type is 'single'
    cb(err, models)

for method in proxyMethods then do (method) ->
  exports.static[method] = (args...) ->
    query = new Query(@)
    query[method].apply query, args

exports.members =
  save: (cb = ->) ->
    return cb(null) unless @isDirty() or @isNew

    @notify 'beforeSave'
    if @isNew
      @notify 'beforeCreate'
    else
      @notify 'beforeUpdate'

    adapter = @constructor.getAdapter()
    idGen = @constructor.getIdGenerator()

    if @isNew and idGen and adapter.idGeneration.pre
      opts =
        data: @dirtyAttributes()
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

    opts =
        data: @dirtyAttributes()
        table: @tableName()
        id: @readAttribute(@primaryKey)
        primaryKey: @primaryKey

    if @isNew
      adapter.create opts, (err, result) =>
        @saveFinished(err, result, cb)
    else
      adapter.update opts, (err, result) =>
        @saveFinished(err, result, cb)

  delete: (cb = ->) ->

    return cb(null) if @isNew

    @notify 'beforeDelete'

    adapter = @constructor.getAdapter()
    opts =
      table: @tableName()
      primaryKey: @primaryKey
      data:
          id: @readAttribute(@primaryKey)

    adapter.delete opts, (err, result) =>
      throw err if err
      for field, value of @data
        @writeAttribute(field, null)
      @isNew = true
      @notify 'afterDelete'
      cb err, result


  saveFinished: (err, result, cb) ->
    wasNew = @isNew
    @isNew = false
    @data[key] = val for key, val of result
    @notify if wasNew then 'afterCreate' else 'afterUpdate'
    cb.call(@, err)
