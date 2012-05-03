ActiveRecord = require '../src'

class User extends ActiveRecord.Model
  fields: ['id', 'username', 'name']

  filterUsername: (username) -> username + " bob"

user = new User()
user.username = "steve"
console.log user # => steve bob