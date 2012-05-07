ActiveRecord = require '../lib'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config
  idMiddleware: 'redis'
  idMiddlewareOptions:
    key: 'user:id'

  fields: ['id', 'username', 'name']

sqlite3 = require('sqlite3').verbose()
db = new sqlite3.Database "#{__dirname}/test.db"
db.serialize ->
  db.run "CREATE TABLE IF NOT EXISTS users (id INTEGER, username VARCHAR(20), name VARCHAR(255))", [], (err) ->
    console.log err if err

    user = new User name: 'Ryan', username: 'meltingice'
    user.save (err) ->
      return console.log err if err
      console.log user.toJSON()