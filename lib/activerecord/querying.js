(function() {
  var Result;

  Result = require('./result').Result;

  exports["static"] = {
    find: function(search, cb) {
      var adapter, model, opts,
        _this = this;
      if (cb == null) {
        cb = function() {};
      }
      if (!Array.isArray(search)) {
        search = [search];
      }
      model = new this;
      adapter = this.getAdapter();
      opts = {
        query: search,
        table: this.tableName()
      };
      if (adapter.isAsync('read')) {
        return adapter.read(opts, function(err, results) {
          return _this.queryCallback(err, results, cb);
        });
      } else {
        return this.queryCallback(null, adapter.read(opts, cb));
      }
    },
    where: function(search) {},
    getAdapter: function() {
      var adapter, config;
      if (this.adapter == null) {
        if (typeof this.prototype.adapter === "object") {
          config = this.prototype.config.get(this.prototype.adapter.adapterName);
          this.adapter = new this.prototype.adapter(config);
        } else if (typeof this.prototype.adapter === "string") {
          adapter = require("./adapters/" + this.prototype.adapter);
          config = this.prototype.config.get(adapter.adapterName);
          this.adapter = new adapter(config);
        }
      }
      return this.adapter;
    },
    queryCallback: function(err, results, cb) {
      var model, models, result, _i, _len;
      models = new Result();
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        model = new this(result, false);
        model.notify('afterFind');
        models.push(model);
      }
      return cb(err, models);
    }
  };

}).call(this);
