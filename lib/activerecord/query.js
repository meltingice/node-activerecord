(function() {
  var Query, array,
    __hasProp = {}.hasOwnProperty;

  array = require('array.js');

  exports.Query = Query = (function() {

    function Query(Model) {
      this.Model = Model;
      this.adapter = null;
      this.type = 'multi';
      this.options = {
        table: this.Model.tableName(),
        primaryKey: this.Model.prototype.primaryKey,
        query: null,
        where: [],
        limit: null,
        order: null
      };
    }

    Query.prototype.find = function(search, cb) {
      var id, key, val, _i, _len;
      if (cb == null) {
        cb = null;
      }
      if (typeof search === "number") {
        search = [search];
      }
      if (Array.isArray(search)) {
        for (_i = 0, _len = search.length; _i < _len; _i++) {
          id = search[_i];
          if (!(this.options.where[this.options.primaryKey] != null)) {
            this.options.where[this.options.primaryKey] = [];
          }
          this.options.where[this.options.primaryKey].push(id);
        }
      } else if (typeof search === "object") {
        for (key in search) {
          if (!__hasProp.call(search, key)) continue;
          val = search[key];
          if (!(this.options.where[key] != null)) {
            this.options.where[key] = [];
          }
          this.options.where[key].push(val);
        }
      }
      if (cb != null) {
        return this.execute(cb);
      } else {
        return this;
      }
    };

    Query.prototype.first = function(cb) {
      var order;
      order = {};
      order[this.options.primaryKey] = 'ASC';
      this.options.order = [order];
      this.options.limit = [1, 1];
      return this.execute(function(err, models) {
        return cb(err, models.first());
      });
    };

    Query.prototype.last = function(cb) {
      var order;
      order = {};
      order[this.options.primaryKey] = 'DESC';
      this.options.order = [order];
      this.options.limit = [1, 1];
      return this.execute(function(err, models) {
        return cb(err, models.last());
      });
    };

    Query.prototype.all = function(cb) {
      this.options.limit = null;
      return this.execute(cb);
    };

    Query.prototype.get = function(cb) {
      return this.execute(cb);
    };

    Query.prototype.execute = function(cb) {
      var adapter,
        _this = this;
      adapter = this.getAdapter();
      return adapter.read(this.options, function(err, results) {
        var models;
        if (err) {
          return cb(err, array());
        }
        models = _this.queryFinished(err, results);
        return cb(err, models);
      });
    };

    Query.prototype.queryFinished = function(err, results) {
      var model, models, result, _i, _len;
      models = array();
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        model = new this.Model(result, false);
        model.notify('afterFind');
        models.push(model);
      }
      return models;
    };

    Query.prototype.getAdapter = function() {
      var adapter, config;
      if (this.adapter == null) {
        if (typeof this.Model.prototype.adapter === "object") {
          config = this.Model.prototype.config.get(this.Model.prototype.adapter.adapterName);
          this.adapter = new this.Model.prototype.adapter(config);
        } else if (typeof this.Model.prototype.adapter === "string") {
          adapter = require("./adapters/" + this.Model.prototype.adapter);
          config = this.Model.prototype.config.get(adapter.adapterName);
          this.adapter = new adapter(config);
        }
      }
      return this.adapter;
    };

    return Query;

  })();

}).call(this);
