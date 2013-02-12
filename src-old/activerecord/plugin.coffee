# Allows you to hook into many of the various steps of the
# ActiveRecord model. 
exports.Plugin = class Plugin
  # The plugin is given 
  constructor: (@model) ->

  isValid: -> true

  beforeInit: -> true
  afterInit: -> true

  afterFind: -> true

  beforeSave: -> true
  afterSave: -> true

  beforeCreate: -> true
  afterCreate: -> true

  beforeUpdate: -> true
  afterUpdate: -> true
  
  beforeDelete: -> true
  afterDelete: -> true