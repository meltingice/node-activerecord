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

User.find [5, 6], (err, users) ->
  console.log users