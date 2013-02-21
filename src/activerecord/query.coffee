array = require 'array.js'

exports.Query = class Query
  constructor: (@Model) ->
    @adapter = null
    @type = 'multi'
    @options =
      table: @Model.tableName()
      primaryKey: @Model::primaryKey
      query: null
      where: []
      limit: null
      order: null

  # Search by primary IDs
  # If given an array of ID(s), the response will
  # also be an array.
  find: (search, cb = null) ->
    search = [search] if typeof search is "number"

    if Array.isArray(search)
      # Multiple by primary key
      for id in search
        if not @options.where[@options.primaryKey]?
          @options.where[@options.primaryKey] = []

        @options.where[@options.primaryKey].push id
    else if typeof search is "object"
      for own key, val of search
        if not @options.where[key]?
          @options.where[key] = []

        @options.where[key].push val

    if cb? then @execute(cb) else return @

  # Accessors
  first: (cb) ->
    order = {}; order[@options.primaryKey] = 'ASC'
    @options.order = [order]
    @options.limit = [1, 1]

    @execute (err, models) ->
      cb(err, models.first())

  last: (cb) ->
    order = {}; order[@options.primaryKey] = 'DESC'
    @options.order = [order]
    @options.limit = [1, 1]

    @execute (err, models) ->
      cb(err, models.last())


  # Forces all results to be returned regardless of previous
  # query options. Use get() instead if you want to keep the
  # built query.
  all: (cb) ->
    @options.limit = null
    @execute(cb)

  get: (cb) -> @execute(cb)
  execute: (cb) ->
    adapter = @getAdapter()

    adapter.read @options, (err, results) =>
      return cb(err, array()) if err

      models = @queryFinished(err, results)
      cb(err, models)

  queryFinished: (err, results) ->
    models = array()
    for result in results
      model = new @Model(result, false)
      model.notify 'afterFind'
      models.push model

    return models

  getAdapter: ->
    unless @adapter?
      if typeof @Model::adapter is "object"
        config = @Model::config.get @Model::adapter.adapterName
        @adapter = new @Model::adapter(config)
      else if typeof @Model::adapter is "string"
        adapter = require "./adapters/#{@Model::adapter}"
        config = @Model::config.get adapter.adapterName
        @adapter = new adapter(config)

    return @adapter