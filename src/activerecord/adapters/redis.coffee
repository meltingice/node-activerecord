# Adapter for Redis
# - Does not support raw SQL queries.
# - Searching with multiple params will perform a search
#   for each param as a separate key.
# - 99% of the time you'll just be searching on primary keys.
# - All data is stored in hashes.

redis = require 'redis'
{Adapter} = require '../adapter'

module.exports = class RedisAdapter extends Adapter
  @adapterName: 'redis'
  idGeneration:
    pre: true
    post: false

  initialize: ->
    @client = redis.createClient @config.port, @config.host

  keyFromOptions: (opts, id = null) ->
    key = "#{opts.table}/#{opts.primaryKey}:"
    key += if id then id else opts.id
    return key

  create: (opts, cb) ->
    data = {}

    for own key, val of opts.data
      continue unless val?
      data[key] = val.toString()

    @client.hmset @keyFromOptions(opts), data, (err) ->
      cb(err, opts.data)

  read: (opts, cb) ->
    multi = @client.multi()

    for own param, values of opts.where
      for value in values
        key = [opts.table]
        key.push "#{param}:#{value}"

        multi.hgetall key.join('/')

    multi.exec (err, results) ->
      return cb(err, []) if err
      cb null, results.filter (r) -> r isnt null

  scoped:
    all: (multi, opts) ->
      @client.keys "#{opts.table}/*", (err, results) ->
        for key in results
          multi.hgetall key
