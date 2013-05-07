# Adapter for MySQL

mysql = require 'mysql'
{Adapter} = require "../adapter"

module.exports = class MysqlAdapter extends Adapter
  @adapterName: 'mysql'
  idGeneration:
    pre: true
    post: true

  initialize: ->
    @db = mysql.createConnection @config

  create: (opts, cb) ->
    @db.query "INSERT INTO #{opts.table} SET ?", opts.data, (err, result) ->
      opts.data[opts.primaryKey] = result.insertId unless err
      return cb(err, opts.data)

  read: (opts, cb) ->
    query = []
    params = []

    if opts.query?
      query = [opts.query]
    else
      query = ["SELECT * FROM #{opts.table}"]

      if Object.keys(opts.where).length > 0
        query.push 'WHERE'
        keys = []
        for key, vals of opts.where
          params.push vals

          switch vals.length
            when 0 then continue
            when 1 then keys.push "#{key} = ?"
            else keys.push "#{key} IN (?)"

        query.push keys.join(' AND ')

    if opts.order?
      orders = []
      for key, dir of opts.order
        orders.push "#{key} #{dir}"

      query.push("ORDER BY " + orders.join ", ")

    query.push "LIMIT #{opts.limit.join(', ')}" if opts.limit?

    query = query.join ' '
    @db.query query, params, cb

  update: (opts, cb) ->

    columns = []
    params = []

    for own c, val of opts.data when c isnt opts.primaryKey
      columns.push "`#{c}`=?"
      params.push val

    tuples = columns.join ','
    params.push opts.data[opts.primaryKey]

    @db.query "UPDATE `#{opts.table}` SET #{tuples} WHERE `#{opts.primaryKey}` = ?", params, (err, result) ->
      return cb(err) if err
      cb null, result

  delete: (opts, cb) ->
    params = []
    sqlClause = "DELETE FROM `#{opts.table}` WHERE `#{opts.primaryKey}` "

    id = opts.data[opts.primaryKey]
    if Array.isArray id
      sqlClause += "IN (?) LIMIT `?`"
      params.push id.join(',')
      params.push id.length
    else
      sqlClause += "= ? LIMIT 1"
      params.push id

    @db.query sqlClause, params, (err, info) ->
      return cb(err) if err
      cb null, info
