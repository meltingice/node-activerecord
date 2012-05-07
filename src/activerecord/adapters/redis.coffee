redis = require 'redis'

module.exports = class RedisAdapter
  defaultOptions:
    host: null
    port: null

  constructor: (config) ->
    opts = @getOptions(config)
    @client = redis.createClient opts.port, opts.host

  read: (finder, namespace, params, opts, cb) ->
    finder = [finder] unless Array.isArray finder
    multi = @client.multi()
    multi.hgetall "#{namespace}:#{f}" for f in finder
    multi.exec (err, replies) =>
      return cb(err, []) if err

      # Redis returns all values as Strings, so we force-parse the
      # primary index as an int.
      result = []
      for r in replies
        continue if r is null
        r[opts.primaryIndex] = parseInt(r[opts.primaryIndex], 10)
        result.push r

      cb(null, result)

  write: (id, namespace, data, newRecord, opts, cb) ->
    @client.hmset "#{namespace}:#{id}", data, (err) => cb(err, null)

  delete: (id, namespace, opts, cb) ->
    @client.del "#{namespace}:#{id}", (err) => cb(err, null)

  getOptions: (opts) ->
    options = {}
    for own key, val of @defaultOptions
      if opts[key]?
        options[key] = opts[key]
      else
        options[key] = val

    options