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
      var id, key, multi, prop, val, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      console.log(opts);
      multi = this.client.multi();
      if (opts.scope != null) {
        this.scoped[opts.scope].call(this, multi, opts);
      } else if (Array.isArray(opts.query)) {
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
      } else if (typeof opts.query === "object") {
        key = [opts.table];
        _ref2 = opts.query;
        for (prop in _ref2) {
          if (!__hasProp.call(_ref2, prop)) continue;
          val = _ref2[prop];
          key.push("" + prop + ":" + val);
        }
        key = key.join('/');
        console.log(key);
        multi.hgetall(key);
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
