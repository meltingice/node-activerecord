ActiveRecord = require '../lib'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config

  adapters: ['redis']
  idMiddleware: ['redis']
  idMiddlewareOptions:
    key: 'users:id'

  fields: ['id', 'username', 'name']


user = new User name: 'Ryan', username: 'meltingice'
user.save (err) ->
  console.log user.toJSON()

  # Re-fetch
  User.find user.id, (err, user) ->
    console.log user.toJSON()