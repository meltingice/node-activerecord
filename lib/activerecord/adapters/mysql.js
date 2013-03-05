(function() {
  var Adapter, MysqlAdapter, mysql,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  mysql = require('mysql');

  Adapter = require("../adapter").Adapter;

  module.exports = MysqlAdapter = (function(_super) {

    __extends(MysqlAdapter, _super);

    function MysqlAdapter() {
      return MysqlAdapter.__super__.constructor.apply(this, arguments);
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
      var dir, key, keys, orders, params, query, vals, _ref, _ref1;
      query = [];
      params = [];
      if (opts.query != null) {
        query = [opts.query];
      } else {
        query = ["SELECT * FROM " + opts.table];
        if (Object.keys(opts.where).length > 0) {
          query.push('WHERE');
          keys = [];
          _ref = opts.where;
          for (key in _ref) {
            vals = _ref[key];
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
        _ref1 = opts.order;
        for (key in _ref1) {
          dir = _ref1[key];
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

    return MysqlAdapter;

  })(Adapter);

}).call(this);
