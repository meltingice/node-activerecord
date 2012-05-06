(function() {
  var MySQLAdapter, mysql,
    __hasProp = {}.hasOwnProperty;

  mysql = require('mysql');

  module.exports = MySQLAdapter = (function() {

    MySQLAdapter.name = 'MySQLAdapter';

    MySQLAdapter.prototype.defaultOptions = {
      primaryIndex: 'id'
    };

    function MySQLAdapter(config) {
      this.config = config;
      this.db = mysql.createClient(this.config);
    }

    MySQLAdapter.prototype.read = function(finder, table, params, opts, cb) {
      var options, sqlClause;
      options = this.getOptions(opts);
      if (typeof finder === "string" && finder.length >= this.MIN_SQL_SIZE) {
        sqlClause = finder;
      } else if (Array.isArray(finder)) {
        sqlClause = "SELECT * FROM `" + table + "` WHERE `" + options.primaryIndex + "` IN (" + (finder.join(',')) + ")";
      } else {
        sqlClause = "SELECT * FROM `" + table + "` WHERE `" + options.primaryIndex + "` = ? LIMIT 1";
        params = [finder];
      }
      return this.db.query(sqlClause, params, function(err, rows, fields) {
        if (err) {
          return cb(err, []);
        } else {
          return cb(null, rows);
        }
      });
    };

    MySQLAdapter.prototype.write = function(id, table, data, newRecord, opts, cb) {
      var key, options, params, sqlClause, val;
      options = this.getOptions(opts);
      params = [];
      for (key in data) {
        if (!__hasProp.call(data, key)) continue;
        val = data[key];
        params.push(val);
      }
      if (newRecord === true) {
        sqlClause = this.insertSql(table, data);
        params.unshift(null);
      } else {
        sqlClause = this.updateSql(id, table, data, options.primaryIndex);
        params.push(id);
      }
      return this.db.query(sqlClause, params, function(err, info) {
        if (err) {
          return cb(err);
        } else {
          return cb(null, {
            lastID: info.insertId
          });
        }
      });
    };

    MySQLAdapter.prototype["delete"] = function(id, table, opts, cb) {
      var options, sqlClause;
      options = this.getOptions(opts);
      sqlClause = "DELETE FROM `" + table + "` WHERE `" + options.primaryIndex + "` = ?";
      return this.db.query(sqlClause, [id], function(err, info) {
        if (err) {
          return cb(err);
        } else {
          return cb(null, info);
        }
      });
    };

    MySQLAdapter.prototype.insertSql = function(table, data) {
      var c, columns, i, val, values, _i, _ref;
      columns = ['`id`'];
      for (c in data) {
        val = data[c];
        columns.push("`" + c + "`");
      }
      values = [];
      for (i = _i = 0, _ref = columns.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        values.push("?");
      }
      columns = columns.join(',');
      values = values.join(',');
      return "INSERT INTO `" + table + "` (" + columns + ") VALUES (" + values + ")";
    };

    MySQLAdapter.prototype.updateSql = function(id, table, data, primaryIndex) {
      var c, columns, tuples, val;
      columns = [];
      for (c in data) {
        if (!__hasProp.call(data, c)) continue;
        val = data[c];
        columns.push("`" + c + "`=?");
      }
      tuples = columns.join(',');
      return "UPDATE `" + table + "` SET " + tuples + " WHERE `" + primaryIndex + "` = ?";
    };

    MySQLAdapter.prototype.getOptions = function(opts) {
      var key, options, val, _ref;
      options = {};
      _ref = this.defaultOptions;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        val = _ref[key];
        if (opts[key] != null) {
          options[key] = opts[key];
        } else {
          options[key] = val;
        }
      }
      return options;
    };

    return MySQLAdapter;

  })();

}).call(this);
