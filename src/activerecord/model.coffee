{Module} = require './module'

exports.Model = class Model extends Module
  @extends  require('./tablenaming').static
  @includes require('./tablenaming').members

  @extends  require('./querying').static
  @includes require('./querying').members
  @includes require('./properties')
  @includes require('./relations')
  @includes require('./events')

  config: null
  observer: null
  fields: []

  primaryKey: 'id'

  constructor: (data = {}, _new = true) ->
    @data = {}
    @initData = data
    @dirtyKeys = {}
    @isNew = _new

    @createProperties()
    @createRelations()

    # If this model isn't new, reset the dirty keys
    @dirtyKeys = {} unless _new
    @data[key] = val for own key, val of data