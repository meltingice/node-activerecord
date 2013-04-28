{Model} = require __dirname + '/../src'
config = require './config'

class User extends Model
  config: config
  adapter: 'mysql'
  fields: ['name', 'firstName', 'lastName', 'email']
  hasMany: -> [Post]

  setName: (name) ->
    names = name.split(" ")
    @firstName = names[0]
    @lastName = names[1]

class Post extends Model
  fields: ['title', 'user_id']
  belongsTo: -> [User]

user = new User
  name: 'Ryan LeFevre'
  email: 'example@example.com'

# user.save ->
User.find 1, (err, user) ->
  console.log user

# user = new User
#   name: 'Bob Hope'
#   email: 'bob@hope.com'

# user.save ->
#   console.log user