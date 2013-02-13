(function() {

  exports["static"] = {
    find: function(search, cb) {
      var adapter, model, opts;
      if (cb == null) {
        cb = function() {};
      }
      if (!Array.isArray(search)) {
        search = [search];
      }
      model = new this;
      adapter = model.getAdapter();
      opts = {
        query: search,
        table: model.tableName()
      };
      if (adapter.isAsync('read')) {
        return adapter.read(opts, cb);
      } else {
        return adapter.read(opts);
      }
    },
    where: function(search) {}
  };

  exports.members = {
    getAdapter: function() {
      var adapter, config;
      if (this.constructor.adapterInstance == null) {
        if (typeof this.adapter === "object") {
          config = this.config.get(this.adapter.adapterName);
          this.constructor.adapterInstance = new this.adapter(config);
        } else if (typeof this.adapter === "string") {
          adapter = require("./adapters/" + this.adapter);
          config = this.config.get(adapter.adapterName);
          this.constructor.adapterInstance = new adapter(config);
        }
      }
      return this.constructor.adapterInstance;
    }
  };

}).call(this);
