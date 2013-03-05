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
      query = ["SELECT * FROM #{opts.table} WHERE"]
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

