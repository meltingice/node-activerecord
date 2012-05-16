{Plugin} = require __dirname + "/../plugin"

module.exports = class json extends Plugin
  toJSON: (incRelations = false, cb = ->) ->
    return {} unless @isLoaded()

    pretty = {}

    for field in @fields
      if @fieldsProtected?
        continue if field in @fieldsProtected

      pretty[field] = @[field]

    if incRelations
      queryWait = {}
      for type in ['hasOne', 'belongsTo', 'hasMany']
        for association in @[type]()
          if Array.isArray association
            association = association[0]

          assocName = association.toAssociationName(type is 'hasMany')
          queryWait[assocName] = true

          do (type, assocName) =>
            @[assocName] (err, assoc) =>
              queryWait[assocName] = false
              return if err

              if type is 'hasMany'
                pretty[assocName] = []
                pretty[assocName].push m.toJSON() for m in assoc
              else
                pretty[assocName] = assoc.toJSON()
              
              for own key, val of queryWait
                return if val is true

              cb(pretty)

    else      
      pretty

