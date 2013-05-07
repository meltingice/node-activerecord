(function() {
  var Adapter, MysqlAdapter, mysql, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mysql = require('mysql');

  Adapter = require("../adapter").Adapter;

  module.exports = MysqlAdapter = (function(_super) {
    __extends(MysqlAdapter, _super);

    function MysqlAdapter() {
      _ref = MysqlAdapter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    MysqlAdapter.adapterName = 'mysql';

    MysqlAdapter.prototype.idGeneration = {
      pre: true,
      post: true
    };

    MysqlAdapter.prototype.initialize = function() {
      return this.db = mysql.createConnection(this.config);
    };

    MysqlAdapter.prototype.create = function(opts, cb) {
      return this.db.query("INSERT INTO " + opts.table + " SET ?", opts.data, function(err, result) {
        if (!err) {
          opts.data[opts.primaryKey] = result.insertId;
        }
        return cb(err, opts.data);
      });
    };

    MysqlAdapter.prototype.read = function(opts, cb) {
      var dir, key, keys, orders, params, query, vals, _ref1, _ref2;

      query = [];
      params = [];
      if (opts.query != null) {
        query = [opts.query];
      } else {
        query = ["SELECT * FROM " + opts.table];
        if (Object.keys(opts.where).length > 0) {
          query.push('WHERE');
          keys = [];
          _ref1 = opts.where;
          for (key in _ref1) {
            vals = _ref1[key];
            params.push(vals);
            switch (vals.length) {
              case 0:
                continue;
              case 1:
                keys.push("" + key + " = ?");
                break;
              default:
                keys.push("" + key + " IN (?)");
            }
          }
          query.push(keys.join(' AND '));
        }
      }
      if (opts.order != null) {
        orders = [];
        _ref2 = opts.order;
        for (key in _ref2) {
          dir = _ref2[key];
          orders.push("" + key + " " + dir);
        }
        query.push("ORDER BY " + orders.join(", "));
      }
      if (opts.limit != null) {
        query.push("LIMIT " + (opts.limit.join(', ')));
      }
      query = query.join(' ');
      return this.db.query(query, params, cb);
    };

    MysqlAdapter.prototype.update = function(opts, cb) {
      var c, columns, params, tuples, val, _ref1;

      columns = [];
      params = [];
      _ref1 = opts.data;
      for (c in _ref1) {
        if (!__hasProp.call(_ref1, c)) continue;
        val = _ref1[c];
        if (!(c !== opts.primaryKey)) {
          continue;
        }
        columns.push("`" + c + "`=?");
        params.push(val);
      }
      tuples = columns.join(',');
      params.push(opts.data[opts.primaryKey]);
      return this.db.query("UPDATE `" + opts.table + "` SET " + tuples + " WHERE `" + opts.primaryKey + "` = ?", params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(null, result);
      });
    };

    MysqlAdapter.prototype["delete"] = function(opts, cb) {
      var id, params, sqlClause;

      params = [];
      sqlClause = "DELETE FROM `" + opts.table + "` WHERE `" + opts.primaryKey + "` ";
      id = opts.data[opts.primaryKey];
      if (Array.isArray(id)) {
        sqlClause += "IN (?) LIMIT `?`";
        params.push(id.join(','));
        params.push(id.length);
      } else {
        sqlClause += "= ? LIMIT 1";
        params.push(id);
      }
      return this.db.query(sqlClause, params, function(err, info) {
        if (err) {
          return cb(err);
        }
        return cb(null, info);
      });
    };

    return MysqlAdapter;

  })(Adapter);

}).call(this);
