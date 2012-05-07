(function() {
  var RedisAdapter, redis,
    __hasProp = {}.hasOwnProperty;

  redis = require('redis');

  module.exports = RedisAdapter = (function() {

    RedisAdapter.name = 'RedisAdapter';

    RedisAdapter.prototype.defaultOptions = {
      host: null,
      port: null
    };

    function RedisAdapter(config) {
      var opts;
      opts = this.getOptions(config);
      this.client = redis.createClient(opts.port, opts.host);
    }

    RedisAdapter.prototype.read = function(finder, namespace, params, opts, cb) {
      var f, multi, _i, _len,
        _this = this;
      if (!Array.isArray(finder)) {
        finder = [finder];
      }
      multi = this.client.multi();
      for (_i = 0, _len = finder.length; _i < _len; _i++) {
        f = finder[_i];
        multi.hgetall("" + namespace + ":" + f);
      }
      return multi.exec(function(err, replies) {
        var r, result, _j, _len1;
        if (err) {
          return cb(err, []);
        }
        result = [];
        for (_j = 0, _len1 = replies.length; _j < _len1; _j++) {
          r = replies[_j];
          if (r === null) {
            continue;
          }
          r[opts.primaryIndex] = parseInt(r[opts.primaryIndex], 10);
          result.push(r);
        }
        return cb(null, result);
      });
    };

    RedisAdapter.prototype.write = function(id, namespace, data, newRecord, opts, cb) {
      var _this = this;
      return this.client.hmset("" + namespace + ":" + id, data, function(err) {
        return cb(err, null);
      });
    };

    RedisAdapter.prototype["delete"] = function(id, namespace, opts, cb) {
      var _this = this;
      return this.client.del("" + namespace + ":" + id, function(err) {
        return cb(err, null);
      });
    };

    RedisAdapter.prototype.getOptions = function(opts) {
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

    return RedisAdapter;

  })();

}).call(this);
