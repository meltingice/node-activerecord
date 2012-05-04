ActiveRecord = require '../src'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config
  fields: ['id', 'username', 'name']

  filterUsername: (username) -> username + " bob"

User.find 1, (user) -> console.log user