(function() {
  var Adapter, RedisAdapter, redis,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  redis = require('redis');

  Adapter = require('../adapter').Adapter;

  module.exports = RedisAdapter = (function(_super) {

    __extends(RedisAdapter, _super);

    function RedisAdapter() {
      return RedisAdapter.__super__.constructor.apply(this, arguments);
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
      var data, key, val, _ref;
      data = {};
      _ref = opts.data;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        val = _ref[key];
        data[key] = val.toString();
      }
      return this.client.hmset(this.keyFromOptions(opts), data, function(err) {
        return cb(err, opts.data);
      });
    };

    RedisAdapter.prototype.read = function(opts, cb) {
      var id, multi, _i, _j, _len, _len1, _ref, _ref1;
      multi = this.client.multi();
      _ref = opts.query;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        console.log(this.keyFromOptions(opts, id));
      }
      _ref1 = opts.query;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        id = _ref1[_j];
        multi.hgetall(this.keyFromOptions(opts, id));
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

    return RedisAdapter;

  })(Adapter);

}).call(this);
