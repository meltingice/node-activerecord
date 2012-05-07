# node-activerecord

[![Build Status](https://secure.travis-ci.org/meltingice/node-activerecord.png?branch=master)](http://travis-ci.org/meltingice/node-activerecord)

An ORM written in Coffeescript that supports multiple database systems (SQL, NoSQL, and even REST), as well as ID generation middleware. It is fully extendable to add new database systems and plugins.

**Note:** this project is new and is still evolving rapidly. A lot is done, but there is still a lot to do.

## Install

node-activerecord is available in npm:

```
npm install activerecord
```

Installing node-activerecord will not automatically install the required libraries for every adapter since this could easily make the library very bloated and dependent on things you may or may not need.

You can use npm to install the required libraries for each adapter:

<table>
  <tr>
    <th>Adapter</th>
    <th>Libraries</th>
  </tr>
  <tr>
    <td>sqlite</td>
    <td>sqlite3</td>
  </tr>
  <tr>
    <td>mysql</td>
    <td>mysql</td>
  </tr>
  <tr>
    <td>REST</td>
    <td>restler</td>
  </tr>
</table>

## Examples

**Configuration**

``` coffeescript
ActiveRecord = require 'activerecord'

module.exports = new ActiveRecord.Configuration
  sqlite:
    database: "#{__dirname}/test.db"
  mysql:
    host: 'localhost'
    database: 'test'
    user: 'test'
    password: 'password'
```

**Model Definition**

``` coffeescript
ActiveRecord = require 'activerecord'
config = require __dirname + "/config"

# Note: uses sqlite3 by default
class User extends ActiveRecord.Model
  config: config
  fields: ['id', 'username', 'name']
```

**Creating a Record**

``` coffeescript
user = new User()
user.username = "meltingice"
user.name = "Ryan"
user.save()
```

**Retreiving a Record**

``` coffeescript
# Find by primary ID
User.find 1, (err, user) -> console.log user.toJSON()

# Find multiple by primary ID
User.findAll [1, 2], (err, users) ->
  console.log user.toJSON() for user in users

# Find by custom query
User.find "SELECT * FROM users WHERE id < ?", 5, (err, user) ->
  console.log user.toJSON()
```

**Updating a Record**

``` coffeescript
User.find 1, (err, user) ->
  user.name = "Bob"
  user.save (err) -> console.log "updated!"
```

**Deleting a Record**

``` coffeescript
User.find 1, (err, user) ->
  user.delete (err) -> console.log "deleted!"
```

**Model Relations**

``` coffeescript
class User extends ActiveRecord.Model
  config: config
  fields: ['id', 'username', 'name']
  hasMany: -> [
    Message
  ]

class Message extends ActiveRecord.Model
  config: config
  fields: ['id', 'user_id', 'text']
  belongsTo: -> [
    User
  ]

Message.find 1, (message) ->
  message.user (err, user) ->
    console.log user.toJSON()
```