(function() {
  var Query, array,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  array = require('array.js');

  exports.Query = Query = (function() {
    function Query(Model) {
      this.Model = Model;
      this.adapter = null;
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
          if (this.options.where[this.options.primaryKey] == null) {
            this.options.where[this.options.primaryKey] = [];
          }
          this.options.where[this.options.primaryKey].push(id);
        }
      } else if (typeof search === "object") {
        for (key in search) {
          if (!__hasProp.call(search, key)) continue;
          val = search[key];
          if (this.options.where[key] == null) {
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

    Query.prototype.limit = function() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          this.options.limit = [0, args[0]];
          break;
        default:
          this.options.limit = args;
      }
      return this;
    };

    Query.prototype.first = function(cb) {
      var order;

      order = {};
      order[this.options.primaryKey] = 'ASC';
      this.options.order = order;
      this.options.limit = [0, 1];
      return this.execute(function(err, models) {
        return cb(err, models.first());
      });
    };

    Query.prototype.last = function(cb) {
      var order;

      order = {};
      order[this.options.primaryKey] = 'DESC';
      this.options.order = order;
      this.options.limit = [0, 1];
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

      adapter = this.Model.getAdapter();
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
      if (this.responseType() === 'single') {
        if (models.length > 0) {
          return models.first();
        }
        return new this.Model;
      } else {
        return models;
      }
    };

    Query.prototype.responseType = function() {
      if (Object.keys(this.options.where).length > 1) {
        return 'multi';
      }
      if (!this.options.where[this.options.primaryKey]) {
        return 'multi';
      }
      switch (this.options.where[this.options.primaryKey].length) {
        case 1:
          return 'single';
        default:
          return 'multi';
      }
    };

    return Query;

  })();

}).call(this);
