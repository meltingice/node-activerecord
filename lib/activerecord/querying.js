(function() {
  var Query, method, proxyMethods, _fn, _i, _len,
    __slice = [].slice;

  Query = require('./query').Query;

  proxyMethods = ['find', 'all', 'first', 'last', 'limit'];

  exports["static"] = {
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
    getIdGenerator: function() {
      var config, idGenerator;

      if (this.idGenerator == null) {
        if (typeof this.prototype.idGenerator === "object") {
          config = this.prototype.config.get('idGenerators')[this.prototype.idGenerator.generatorName];
          this.idGenerator = new this.prototype.idGenerator(config);
        } else if (typeof this.prototype.idGenerator === "string") {
          idGenerator = require("./id-generators/" + this.prototype.idGenerator);
          config = this.prototype.config.get('idGenerators')[idGenerator.generatorName];
          this.idGenerator = new idGenerator(config);
        } else {
          return false;
        }
      }
      return this.idGenerator;
    },
    queryCallback: function(err, results, type, cb) {
      var model, models, result, _i, _len;

      models = array();
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        model = new this(result, false);
        model.notify('afterFind');
        models.push(model);
      }
      if (type === 'single') {
        models = models.first();
      }
      return cb(err, models);
    }
  };

  _fn = function(method) {
    return exports["static"][method] = function() {
      var args, query;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      query = new Query(this);
      return query[method].apply(query, args);
    };
  };
  for (_i = 0, _len = proxyMethods.length; _i < _len; _i++) {
    method = proxyMethods[_i];
    _fn(method);
  }

  exports.members = {
    save: function(cb) {
      var adapter, idGen, opts,
        _this = this;

      if (cb == null) {
        cb = function() {};
      }
      if (!(this.isDirty() || this.isNew)) {
        return cb(null);
      }
      this.notify('beforeSave');
      if (this.isNew) {
        this.notify('beforeCreate');
      } else {
        this.notify('beforeUpdate');
      }
      adapter = this.constructor.getAdapter();
      idGen = this.constructor.getIdGenerator();
      if (this.isNew && idGen && adapter.idGeneration.pre) {
        opts = {
          data: this.dirtyAttributes(),
          table: this.tableName(),
          primaryKey: this.primaryKey
        };
        return idGen.generate(opts, function(err, id) {
          if (err) {
            return false;
          }
          _this.writeAttribute(_this.primaryKey, id);
          return _this.performSave(cb);
        });
      } else {
        return this.performSave(cb);
      }
    },
    performSave: function(cb) {
      var adapter, opts,
        _this = this;

      adapter = this.constructor.getAdapter();
      opts = {
        data: this.dirtyAttributes(),
        table: this.tableName(),
        id: this.readAttribute(this.primaryKey),
        primaryKey: this.primaryKey
      };
      if (this.isNew) {
        return adapter.create(opts, function(err, result) {
          return _this.saveFinished(err, result, cb);
        });
      } else {
        return adapter.update(opts, function(err, result) {
          return _this.saveFinished(err, result, cb);
        });
      }
    },
    "delete": function(cb) {
      var adapter, opts,
        _this = this;

      if (cb == null) {
        cb = function() {};
      }
      if (this.isNew) {
        return cb(null);
      }
      this.notify('beforeDelete');
      adapter = this.constructor.getAdapter();
      opts = {
        table: this.tableName(),
        primaryKey: this.primaryKey,
        data: {
          id: this.readAttribute(this.primaryKey)
        }
      };
      return adapter["delete"](opts, function(err, result) {
        var field, value, _ref;

        if (err) {
          throw err;
        }
        _ref = _this.data;
        for (field in _ref) {
          value = _ref[field];
          _this.writeAttribute(field, null);
        }
        _this.isNew = true;
        _this.notify('afterDelete');
        return cb(err, result);
      });
    },
    saveFinished: function(err, result, cb) {
      var key, val, wasNew;

      wasNew = this.isNew;
      this.isNew = false;
      for (key in result) {
        val = result[key];
        this.data[key] = val;
      }
      this.notify(wasNew ? 'afterCreate' : 'afterUpdate');
      return cb.call(this, err);
    }
  };

}).call(this);
