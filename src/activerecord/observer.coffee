exports.Observer = class Observer
  isAsync: (method) -> @[method].length is 1
  
  # The callbacks. Override these.
  afterFind: -> true
  beforeSave: -> true
  beforeCreate: -> true
  beforeUpdate: -> true
  beforeDelete: -> true
  afterSave: -> true
  afterCreate: -> true
  afterUpdate: -> true
  afterDelete: -> true