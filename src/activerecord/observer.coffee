exports.Observer = class Observer
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