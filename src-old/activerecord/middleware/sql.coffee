module.exports = class SQLMiddleware
  @supports:
    beforeWrite: false
    afterWrite: true

  constructor: (config) ->
  afterWrite: (options, results, cb) ->
    if results
      cb(null, results.lastID)
    else
      cb(true, null)