exports.static =
  # Search by primary IDs
  # If given an array of ID(s), the response will
  # also be an array.
  find: (search, cb = ->) ->
    search = [search] unless Array.isArray(search)

    model = new @
    adapter = model.getAdapter()

    opts =
      query: search
      table: model.tableName()

    if adapter.isAsync 'read'
      adapter.read opts, cb
    else
      adapter.read opts

  where: (search) ->

exports.members =
  getAdapter: ->
    unless @constructor.adapterInstance?
      if typeof @adapter is "object"
        config = @config.get @adapter.adapterName
        @constructor.adapterInstance = new @adapter(config)
      else if typeof @adapter is "string"
        adapter = require "./adapters/#{@adapter}"
        config = @config.get adapter.adapterName
        @constructor.adapterInstance = new adapter(config)

    return @constructor.adapterInstance