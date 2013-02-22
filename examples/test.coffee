{Model, Observer} = require __dirname + '/../src'
config = require './config'

class UserObserver extends Observer
  filterName: (name) ->
    names = name.split(" ")
    @firstName = names[0]
    @lastName = names[1]

class User extends Model
  config: config
  adapter: 'redis'
  idGenerator: 'redis'
  fields: ['name', 'firstName', 'lastName', 'email']
  observer: UserObserver
  hasMany: -> [Post]

class Post extends Model
  fields: ['title', 'user_id']
  belongsTo: -> [User]

# user = new User()
# user.name = "Bob Hope"
# user.email = "bob@hope.com"
# user.save ->
#   console.log user

# user = new User
#   name: 'Ryan LeFevre'
#   email: 'ryan@layervault.com'

# user.save ->
#   User.find(1).find(2).get (err, users) ->
#     console.log users

#   User.find([1, 2]).get (err, users) ->
#     console.log users

User.find 1, (err, user) ->
  console.log user

User.find [1, 2], (err, users) ->
  console.log users