array = require 'array.js'

exports.Query = class Query
  constructor: (@Model) ->
    @adapter = null
    @options =
      table: @Model.tableName()
      primaryKey: @Model::primaryKey
      query: null # Raw SQL
      where: []   # [["foo > ? & bar > ?", [1, 2]]]
      limit: null # [start, length]
      order: null # {key: 'ASC/DESC'}

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

  limit: (args...) ->
    switch args.length
      when 1 then @options.limit = [0, args[0]]
      else @options.limit = args

    return @

  # Accessors
  first: (cb) ->
    order = {}
    order[@options.primaryKey] = 'ASC'
    @options.order = order
    @options.limit = [0, 1]

    @execute (err, models) ->
      cb(err, models.first())

  last: (cb) ->
    order = {}; order[@options.primaryKey] = 'DESC'
    @options.order = order
    @options.limit = [0, 1]

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
    adapter = @Model.getAdapter()

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

    if @responseType() is 'single'
      return models.first() if models.length > 0
      return new @Model
    else
      return models

  responseType: ->
    return 'multi' if Object.keys(@options.where).length > 1
    return 'multi' unless @options.where[@options.primaryKey]

    switch @options.where[@options.primaryKey].length
      when 1 then 'single'
      else 'multi'
