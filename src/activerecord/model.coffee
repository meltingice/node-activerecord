# The main class that represents our data in the database
# The rest of the code is loaded in via modules in order
# to keep things organized.
#
# When creating a new model, extend the Model class and add
# in your definitions.

{Module} = require 'coffeescript-module'

exports.Model = class Model extends Module
  @extends  require('./tablenaming').static
  @includes require('./tablenaming').members

  @extends  require('./querying').static
  @includes require('./querying').members
  @includes require('./properties')
  @includes require('./relations')
  @includes require('./events')

  # We must set the configuration so we can create the database
  # connection.
  config: null

  # We don't support a predefined schema at this time, so we have
  # to manually specify the names of each field in this model.
  fields: []

  # Our default primary key name. Can change this if needed.
  primaryKey: 'id'

  # When creating the model, we can pass in an object of data-values
  # that will get mass assigned to this model. In the future, we can
  # restrict which fields are allowed to be mass assigned.
  constructor: (data = {}, _new = true) ->
    @data = {}
    @initData = data
    @dirtyKeys = {}
    @isNew = _new

    # Create the properties on this model based on our defined fields
    @createProperties()

    # Create the model relations based on our belongsTo/hasOne/hasMany
    @createRelations()

    # If this model isn't new, reset the dirty keys
    @dirtyKeys = {} unless _new
    @[key] = val for own key, val of data