(function() {
  var Adapter, RedisAdapter, redis, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  redis = require('redis');

  Adapter = require('../adapter').Adapter;

  module.exports = RedisAdapter = (function(_super) {
    __extends(RedisAdapter, _super);

    function RedisAdapter() {
      _ref = RedisAdapter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    RedisAdapter.adapterName = 'redis';

    RedisAdapter.prototype.idGeneration = {
      pre: true,
      post: false
    };

    RedisAdapter.prototype.initialize = function() {
      return this.client = redis.createClient(this.config.port, this.config.host);
    };

    RedisAdapter.prototype.keyFromOptions = function(opts, id) {
      var key;

      if (id == null) {
        id = null;
      }
      key = "" + opts.table + "/" + opts.primaryKey + ":";
      key += id ? id : opts.id;
      return key;
    };

    RedisAdapter.prototype.create = function(opts, cb) {
      var data, key, val, _ref1;

      data = {};
      _ref1 = opts.data;
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        val = _ref1[key];
        if (val == null) {
          continue;
        }
        data[key] = val.toString();
      }
      return this.client.hmset(this.keyFromOptions(opts), data, function(err) {
        return cb(err, opts.data);
      });
    };

    RedisAdapter.prototype.read = function(opts, cb) {
      var key, multi, param, value, values, _i, _len, _ref1;

      multi = this.client.multi();
      _ref1 = opts.where;
      for (param in _ref1) {
        if (!__hasProp.call(_ref1, param)) continue;
        values = _ref1[param];
        for (_i = 0, _len = values.length; _i < _len; _i++) {
          value = values[_i];
          key = [opts.table];
          key.push("" + param + ":" + value);
          multi.hgetall(key.join('/'));
        }
      }
      return multi.exec(function(err, results) {
        if (err) {
          return cb(err, []);
        }
        return cb(null, results.filter(function(r) {
          return r !== null;
        }));
      });
    };

    RedisAdapter.prototype.scoped = {
      all: function(multi, opts) {
        return this.client.keys("" + opts.table + "/*", function(err, results) {
          var key, _i, _len, _results;

          _results = [];
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            key = results[_i];
            console.log(key);
            _results.push(multi.hgetall(key));
          }
          return _results;
        });
      }
    };

    return RedisAdapter;

  })(Adapter);

}).call(this);
