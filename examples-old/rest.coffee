ActiveRecord = require '../lib'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config
  adapters: ['rest']
  fields: ['id', 'username', 'name', 'location', 'bio']


User.find 'meltingice', username: 1, (err, user) ->
  console.log user.toJSON()