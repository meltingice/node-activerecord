(function() {
  var Result;

  Result = require('./result').Result;

  exports["static"] = {
    find: function(search, cb) {
      var adapter, model, opts, type,
        _this = this;
      if (cb == null) {
        cb = function() {};
      }
      if (Array.isArray(search)) {
        type = 'multi';
      } else {
        type = 'single';
        search = [search];
      }
      model = new this;
      adapter = this.getAdapter();
      opts = {
        query: search,
        table: this.tableName(),
        primaryKey: this.prototype.primaryKey
      };
      if (adapter.isAsync('read')) {
        return adapter.read(opts, function(err, results) {
          return _this.queryCallback(err, results, type, cb);
        });
      } else {
        return this.queryCallback(null, adapter.read(opts, type, cb));
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
        }
      }
      return this.idGenerator;
    },
    queryCallback: function(err, results, type, cb) {
      var model, models, result, _i, _len;
      models = new Result();
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        model = new this(result, false);
        model.notify('afterFind');
        models.push(model);
      }
      if (type === 'single') {
        models = models.first;
      }
      return cb(err, models);
    }
  };

  exports.members = {
    save: function(cb) {
      var idGen, opts,
        _this = this;
      if (cb == null) {
        cb = function() {};
      }
      if (!(this.isDirty || this.isNew)) {
        return cb(null);
      }
      this.notify('beforeSave');
      if (this.isNew) {
        this.notify('beforeCreate');
      } else {
        this.notify('beforeUpdate');
      }
      idGen = this.constructor.getIdGenerator();
      if (this.isNew && idGen.type === 'pre') {
        opts = {
          data: this.data,
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
      if (this.isNew) {
        opts = {
          data: this.data,
          table: this.tableName(),
          id: this.data[this.primaryKey],
          primaryKey: this.primaryKey
        };
        return adapter.create(opts, function(err, result) {
          return _this.saveFinished(err, result, cb);
        });
      } else {
        opts = {
          data: this.data,
          table: this.tableName()
        };
        return adapter.update(opts, function(err, result) {
          return _this.safeFinished(err, result, cb);
        });
      }
    },
    saveFinished: function(err, result, cb) {
      this.isNew = false;
      return cb();
    }
  };

}).call(this);
