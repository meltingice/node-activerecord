{Module} = require './module'

exports.Model = class Model extends Module
  @extends  require('./tablenaming').static
  @includes require('./tablenaming').members

  @extends  require('./querying')
  @includes require('./properties')
  @includes require('./relations')

  config: null
  fields: []

  primaryIndex: 'id'

  constructor: (data = {}) ->
    @data = {}
    @initData = data
    @dirtyKeys = {}
    @isDirty = false
    @new = true

    @createProperties()
    @createRelations()