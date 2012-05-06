ActiveRecord = require '../lib'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config
  fields: ['id', 'username', 'name']
  adapters: ['mysql']

  isValid: ->
    return false if @username?.length is 0 or @name?.length is 0
    return true


User.find 1, (err, user) ->
  user.username = "foobarfoo"
  user.save (err) ->
    console.log err if err
    console.log user.toJSON()