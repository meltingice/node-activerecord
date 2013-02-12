relationTypes = ['hasOne', 'belongsTo', 'hasMany']

module.exports =
  createRelations: ->
    for type in relationTypes
      continue unless @[type]?

      for relation in @[type]()
        do (relation, type) =>
          name = relation.relationName(type is 'hasMany')
          @[name] = (cb) -> @getRelation relation, cb