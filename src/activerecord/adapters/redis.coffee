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
    data[key] = val.toString() for own key, val of opts.data

    @client.hmset @keyFromOptions(opts), data, (err) ->
      cb(err, opts.data)

  read: (opts, cb) ->
    multi = @client.multi()
    console.log @keyFromOptions(opts, id) for id in opts.query
    multi.hgetall @keyFromOptions(opts, id) for id in opts.query
    multi.exec (err, results) ->
      return cb(err, []) if err
      cb null, results.filter (r) -> r isnt null
