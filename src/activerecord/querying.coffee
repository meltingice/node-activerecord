{Result} = require './result'

exports.static =
  # Search by primary IDs
  # If given an array of ID(s), the response will
  # also be an array.
  find: (search, cb = ->) ->
    search = [search] unless Array.isArray(search)

    model = new @
    adapter = @getAdapter()

    opts =
      query: search
      table: @tableName()

    if adapter.isAsync 'read'
      adapter.read opts, (err, results) =>
        @queryCallback(err, results, cb)
    else
      @queryCallback null, adapter.read opts, cb

  where: (search) ->

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

  queryCallback: (err, results, cb) ->
    models = new Result()
    for result in results
      model =  new @(result, false)
      model.notify 'afterFind'
      models.push model

    cb(err, models)

