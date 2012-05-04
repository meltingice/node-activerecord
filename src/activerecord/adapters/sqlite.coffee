sqlite3 = require('sqlite3').verbose()

module.exports = class SQLiteAdapter
  MIN_SQL_SIZE: 15
  defaultOptions:
    primaryIndex: 'id'

  constructor: (@config) ->
    @db = new sqlite3.Database @config.database

  read: (finder, table, params = [], opts = {}, cb) ->
    options = {}
    for own key, val of @defaultOptions
      if opts[key]?
        options[key] = opts[key]
      else
        options[key] = val

    if typeof finder is "string" and finder.length <= @MIN_SQL_SIZE
      sqlClause = finder
    else if Array.isArray finder
      sqlClause = "SELECT * FROM `#{table}` WHERE `#{options.primaryIndex}` IN (#{finder.join(',')})"
    else
      sqlClause = "SELECT * FROM `#{table}` WHERE `#{options.primaryIndex}` = ? LIMIT 1"
      params.push finder

    @db.serialize =>
      @db.all sqlClause, params, (err, rows) ->
        if err then cb([]) else cb(rows)

  write: (cb) ->
  delete: (cb) ->