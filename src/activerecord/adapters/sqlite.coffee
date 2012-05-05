sqlite3 = require('sqlite3').verbose()

module.exports = class SQLiteAdapter
  MIN_SQL_SIZE: 15
  defaultOptions:
    primaryIndex: 'id'

  constructor: (@config) ->
    @db = new sqlite3.Database @config.database

  read: (finder, table, params = [], opts = {}, cb) ->
    options = @getOptions(opts)    

    if typeof finder is "string" and finder.length <= @MIN_SQL_SIZE
      sqlClause = finder
    else if Array.isArray finder
      sqlClause = "SELECT * FROM `#{table}` WHERE `#{options.primaryIndex}` IN (#{finder.join(',')})"
    else
      sqlClause = "SELECT * FROM `#{table}` WHERE `#{options.primaryIndex}` = ? LIMIT 1"
      params = [finder]

    @db.serialize =>
      @db.all sqlClause, params, (err, rows) ->
        if err
          console.log err
          cb([])
        else
          cb(rows)

  write: (id, table, data, newRecord, opts = {}, cb) ->
    options = @getOptions(opts)

    params = []
    params.push val for own key, val of data

    if newRecord is true
      sqlClause = @insertSql(table, data)
      params.unshift null
    else
      sqlClause = @updateSql(id, table, data, options.primaryIndex)
      params.push id

    @db.serialize =>
      @db.run sqlClause, params, (err, info...) ->
        if err
          console.log err
          cb(null)
        else
          cb(@)

  delete: (cb) ->

  insertSql: (table, data) ->
    columns = ['`id`']
    columns.push "`#{c}`" for c, val of data

    values = []
    values.push "?" for i in [0...columns.length]

    columns = columns.join ','
    values = values.join ','

    "INSERT INTO `#{table}` (#{columns}) VALUES (#{values})"

  updateSql: (id, table, data, primaryIndex) ->
    columns = []
    columns.push "`#{c}`=?" for own c, val of data

    tuples = columns.join ','

    "UPDATE `#{table}` SET #{tuples} WHERE `#{primaryIndex}` = ?"

  getOptions: (opts) ->
    options = {}
    for own key, val of @defaultOptions
      if opts[key]?
        options[key] = opts[key]
      else
        options[key] = val

    options