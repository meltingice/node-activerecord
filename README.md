# node-activerecord

An ORM written in Coffeescript that supports multiple database systems, both SQL and NoSQL, as well as ID generation middleware. It is fully extendable to add new database systems and plugins.

**Note:** this project is new and is not finished yet. There is still a lot of functionality to add.

## Examples

**Model Definition**

``` coffeescript
ActiveRecord = require '../src'
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
User.find 1, (user) -> console.log user.toJSON()
```