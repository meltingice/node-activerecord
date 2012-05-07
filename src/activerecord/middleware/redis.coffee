redis = require 'redis'

module.exports = class RedisMiddleware
  @supports:
    beforeWrite: true
    afterWrite: false

  defaultOptions:
    host: null
    port: null

  constructor: (config) ->
    opts = @getOptions(config)
    @client = redis.createClient opts.port, opts.host

  beforeWrite: (opts, cb) ->
    @client.incr opts.key, (err, res) -> cb(err, res)

  getOptions: (opts) ->
    options = {}
    for own key, val of @defaultOptions
      if opts[key]?
        options[key] = opts[key]
      else
        options[key] = val

    options