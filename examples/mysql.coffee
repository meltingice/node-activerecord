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

User.find(1).limit(1).get (err, user) ->
  console.log user

# user = new User
#   name: 'Bob Hope'
#   email: 'bob@hope.com'

# user.save ->
#   console.log user