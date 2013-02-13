{Adapter} = require '../adapter'

exports.RedisAdapter = class RedisAdapter extends Adapter
  idPreGeneration: true

  initialize: ->
    @client = redis.createClient @options.port, @options.host

  keyFromOptions: (opts, id = null) ->
    key = "#{opts.table}/#{opts.primaryKey}:"
    key += if id then id else opts.id
    return key

  create: (opts, cb) ->
    @client.hmset @keyFromOptions(opts), opts.data, (err) ->
      cb(err, opts.data)

  read: (opts, cb) ->
    multi = @client.multi()
    multi.hgetall @keyFromOptions(opts, id) for id in opts.query
    multi.exec (err, results) ->
      return cb(err, []) if err
      cb(null, results)
