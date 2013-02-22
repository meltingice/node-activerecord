(function() {
  var IdGenerator, RedisIdGenerator, redis,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  redis = require('redis');

  IdGenerator = require('../idgenerator').IdGenerator;

  module.exports = RedisIdGenerator = (function(_super) {

    __extends(RedisIdGenerator, _super);

    function RedisIdGenerator() {
      return RedisIdGenerator.__super__.constructor.apply(this, arguments);
    }

    RedisIdGenerator.generatorName = 'redis';

    RedisIdGenerator.prototype.initialize = function() {
      return this.client = redis.createClient(this.config.port, this.config.host);
    };

    RedisIdGenerator.prototype.generate = function(opts, cb) {
      var key;
      if (cb == null) {
        cb = function() {};
      }
      key = "" + opts.table + "/" + opts.primaryKey;
      return this.client.incr(key, cb);
    };

    return RedisIdGenerator;

  })(IdGenerator);

}).call(this);
