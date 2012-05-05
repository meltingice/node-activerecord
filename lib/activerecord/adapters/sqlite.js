(function() {
  var SQLiteAdapter, sqlite3,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  sqlite3 = require('sqlite3');

  module.exports = SQLiteAdapter = (function() {

    SQLiteAdapter.name = 'SQLiteAdapter';

    SQLiteAdapter.prototype.MIN_SQL_SIZE = 15;

    SQLiteAdapter.prototype.defaultOptions = {
      primaryIndex: 'id'
    };

    function SQLiteAdapter(config) {
      this.config = config;
      this.db = new sqlite3.Database(this.config.database);
    }

    SQLiteAdapter.prototype.read = function(finder, table, params, opts, cb) {
      var options, sqlClause,
        _this = this;
      if (params == null) {
        params = [];
      }
      if (opts == null) {
        opts = {};
      }
      options = this.getOptions(opts);
      if (typeof finder === "string" && finder.length <= this.MIN_SQL_SIZE) {
        sqlClause = finder;
      } else if (Array.isArray(finder)) {
        sqlClause = "SELECT * FROM `" + table + "` WHERE `" + options.primaryIndex + "` IN (" + (finder.join(',')) + ")";
      } else {
        sqlClause = "SELECT * FROM `" + table + "` WHERE `" + options.primaryIndex + "` = ? LIMIT 1";
        params = [finder];
      }
      return this.db.serialize(function() {
        return _this.db.all(sqlClause, params, function(err, rows) {
          if (err) {
            console.log(err);
            return cb([]);
          } else {
            return cb(rows);
          }
        });
      });
    };

    SQLiteAdapter.prototype.write = function(id, table, data, newRecord, opts, cb) {
      var key, options, params, sqlClause, val,
        _this = this;
      if (opts == null) {
        opts = {};
      }
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
      return this.db.serialize(function() {
        return _this.db.run(sqlClause, params, function() {
          var err, info;
          err = arguments[0], info = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (err) {
            console.log(err);
            return cb(null);
          } else {
            return cb(this);
          }
        });
      });
    };

    SQLiteAdapter.prototype["delete"] = function(id, table, opts, cb) {
      var options, sqlClause,
        _this = this;
      if (opts == null) {
        opts = {};
      }
      options = this.getOptions(opts);
      sqlClause = "DELETE FROM `" + table + "` WHERE `" + options.primaryIndex + "` = ?";
      return this.db.serialize(function() {
        return _this.db.run(sqlClause, id, function() {
          var err, info;
          err = arguments[0], info = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (err) {
            console.log(err);
            return cb(null);
          } else {
            return cb(this);
          }
        });
      });
    };

    SQLiteAdapter.prototype.insertSql = function(table, data) {
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

    SQLiteAdapter.prototype.updateSql = function(id, table, data, primaryIndex) {
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

    SQLiteAdapter.prototype.getOptions = function(opts) {
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

    return SQLiteAdapter;

  })();

}).call(this);
