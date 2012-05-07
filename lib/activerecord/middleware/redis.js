(function() {
  var RedisMiddleware, redis,
    __hasProp = {}.hasOwnProperty;

  redis = require('redis');

  module.exports = RedisMiddleware = (function() {

    RedisMiddleware.name = 'RedisMiddleware';

    RedisMiddleware.supports = {
      beforeWrite: true,
      afterWrite: false
    };

    RedisMiddleware.prototype.defaultOptions = {
      host: null,
      port: null
    };

    function RedisMiddleware(config) {
      var opts;
      opts = this.getOptions(config);
      this.client = redis.createClient(opts.port, opts.host);
    }

    RedisMiddleware.prototype.beforeWrite = function(opts, cb) {
      return this.client.incr(opts.key, function(err, res) {
        return cb(err, res);
      });
    };

    RedisMiddleware.prototype.getOptions = function(opts) {
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

    return RedisMiddleware;

  })();

}).call(this);
