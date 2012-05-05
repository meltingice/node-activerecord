ActiveRecord = require '../lib'
config = require __dirname + "/config"

class User extends ActiveRecord.Model
  config: config
  fields: ['id', 'username', 'name']

  filterUsername: (username) -> username + " bob"
  isValid: ->
    return false if @username?.length is 0 or @name?.length is 0
    return true


sqlite3 = require('sqlite3').verbose()
db = new sqlite3.Database "#{__dirname}/test.db"
db.serialize ->
  db.run "DROP TABLE users"
  db.run "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(20), name VARCHAR(255))", [], (err) ->
    console.log err if err

    user = new User name: 'Ryan', username: 'meltingice'
    user.save (err) ->
      unless err
        User.find 1, (user) ->
          console.log user.toJSON()
          user.name = "Bob"
          user.save (err) ->
            console.log user.toJSON()

            user.delete -> console.log user.toJSON()