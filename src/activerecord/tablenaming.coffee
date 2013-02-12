{Inflection} = require './inflection'

exports.static =
  tableName: -> @toTableName(@name)
  toTableName: (name) ->
    Inflection.pluralize Inflection.underscore(name, true)

  relationName: (plural = false) ->
    name = Inflection.camelize(@tableName(), false)
    if plural then Inflection.pluralize(name) else name

exports.members =
  tableName: -> @constructor.tableName()