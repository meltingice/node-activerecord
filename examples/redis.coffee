ActiveRecord = require '../lib'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config

  adapters: ['redis']
  idMiddleware: ['redis']
  idMiddlewareOptions:
    key: 'users:id'

  fields: ['id', 'username', 'name']


start = (new Date()).getTime()
User.find 1, (err, user) ->
  end = (new Date()).getTime()

  console.log "retrieved in #{end - start}ms"