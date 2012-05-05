ActiveRecord = require '../lib'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config
  fields: ['id', 'username', 'name']

  filterUsername: (username) -> username + " bob"


sqlite3 = require('sqlite3').verbose()
db = new sqlite3.Database "#{__dirname}/test.db"
db.serialize ->
  db.run "DROP TABLE users"
  db.run "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), name VARCHAR(255))", [], (err) ->
    console.log err if err

    user = new User name: 'Ryan', username: 'meltingice'
    user.save ->
      User.find 1, (user) -> console.log user.toJSON()