redis = require 'redis'
{IdGenerator} = require '../idgenerator'

module.exports = class RedisIdGenerator extends IdGenerator
  @generatorName: 'redis'

  initialize: ->
    @client = redis.createClient @config.port, @config.host

  generate: (opts, cb = ->) ->
    key = "#{opts.table}/#{opts.primaryKey}"
    @client.incr key, cb