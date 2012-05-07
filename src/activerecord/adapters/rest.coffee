rest = require 'restler'

module.exports = class RestAdapter
  constructor: (@config) ->

  read: (action, endpoint, params, opts, cb) ->
    url = @buildUrl action, endpoint

    if params.length is 1
      params = params[0]

    rest.get(url, query: params).on 'complete', (data, resp) ->
      data = [data] unless Array.isArray data
      cb(null, data)

  # Write/delete operations are noop right now since they will require
  # authentication.
  write: (id, table, data, newRecord, opts, cb) -> cb(null, null)
  delete: (id, table, opts, cb) -> cb(null, null)

  buildUrl: (action, endpoint) ->
    "#{@config.url}/#{@config.version}/#{endpoint}/#{action}.json"
