(function() {
  var Model,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  exports.Model = Model = (function() {

    Model.name = 'Model';

    Model.prototype.tableName = "";

    Model.prototype.primaryIndex = 'id';

    Model.prototype.fields = [];

    Model.prototype.adapters = ["sqlite"];

    Model.prototype._associations = {};

    Model.prototype.hasMany = function() {
      return [];
    };

    Model.prototype.hasOne = function() {
      return [];
    };

    Model.prototype.belongsTo = function() {
      return [];
    };

    Model.find = function() {
      var args, cb, finished, result;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (arguments.length < 1 || arguments[0] === null) {
        return new this;
      }
      if (typeof args[args.length - 1] === "function") {
        cb = args.pop();
      } else {
        cb = function() {};
      }
      finished = function(results) {
        return cb(results[0]);
      };
      args.push(finished);
      return result = this.findAll.apply(this, args);
    };

    Model.findAll = function() {
      var Adapter, adapter, args, cb, finder, model, results,
        _this = this;
      finder = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      model = new this;
      if (typeof args[args.length - 1] === "function") {
        cb = args.pop();
      } else {
        cb = function() {};
      }
      Adapter = require("" + __dirname + "/adapters/" + model.adapters[0]);
      adapter = new Adapter(model.config.get(model.adapters[0]));
      return results = adapter.read(finder, model.tableName(), args, {
        primaryIndex: model.primaryIndex
      }, function(rows) {
        var resultSet, row, _i, _len;
        resultSet = [];
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          model = new _this(row, false);
          model.notify('afterFind');
          resultSet.push(model);
        }
        return cb(resultSet);
      });
    };

    Model.toAssociationName = function(plural) {
      var name;
      if (plural == null) {
        plural = false;
      }
      name = this.name.toLowerCase();
      if (plural) {
        return name + "s";
      } else {
        return name;
      }
    };

    function Model(data, tainted) {
      var association, field, type, _fn, _fn1, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2,
        _this = this;
      if (data == null) {
        data = {};
      }
      if (tainted == null) {
        tainted = true;
      }
      this.notify('beforeInit');
      this._data = {};
      this._init_data = data;
      this._dirty_data = {};
      this._is_dirty = false;
      this._new = true;
      _ref = this.fields;
      _fn = function(field) {
        return Object.defineProperty(_this, field, {
          get: function() {
            return this._data[field];
          },
          set: function(val) {
            var filterFunc;
            if (this._data[field] !== val) {
              filterFunc = "filter" + field.charAt(0).toUpperCase() + field.slice(1);
              if ((this[filterFunc] != null) && typeof this[filterFunc] === "function") {
                val = this[filterFunc](val);
              }
              this._data[field] = val;
              return this._dirty_data[field] = val;
            }
          },
          enumerable: true,
          configurable: true
        });
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        _fn(field);
        if (this._init_data[field]) {
          this._data[field] = this._init_data[field];
        } else {
          this._data[field] = null;
        }
      }
      _ref1 = ['hasOne', 'belongsTo', 'hasMany'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        type = _ref1[_j];
        _ref2 = this[type]();
        _fn1 = function(association, type) {
          var assocName;
          assocName = association.toAssociationName(type === 'hasMany');
          return _this[assocName] = function(cb) {
            return this.getAssociation(association, cb);
          };
        };
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          association = _ref2[_k];
          if (Array.isArray(association)) {
            association = association[0];
          }
          _fn1(association, type);
        }
      }
      if (tainted) {
        this._dirty_data = this._init_data;
        this._is_dirty = true;
      }
      this.notify('afterInit');
    }

    Model.prototype.save = function(cb) {
      var Adapter, adapter, primaryIndex, _i, _len, _ref, _results,
        _this = this;
      if (cb == null) {
        cb = function() {};
      }
      if (!this.notify('beforeSave')) {
        return cb(true);
      }
      if (!this._is_dirty) {
        return cb();
      }
      if (this.isNew()) {
        this.notify("beforeCreate");
      } else {
        this.notify("beforeUpdate");
      }
      if (!this.isValid()) {
        return cb(true);
      }
      primaryIndex = this._init_data[this.primaryIndex];
      _ref = this.adapters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        adapter = _ref[_i];
        Adapter = require("" + __dirname + "/adapters/" + adapter);
        adapter = new Adapter(this.config.get(adapter));
        _results.push(adapter.write(primaryIndex, this.tableName(), this._dirty_data, this.isNew(), {
          primaryIndex: this.primaryIndex
        }, function(results) {
          if (results === null) {
            return cb(true);
          }
          if (_this.isNew()) {
            _this._data[_this.primaryIndex] = results.lastID;
          }
          _this._init_data[_this.primaryIndex] = results.lastID;
          if (_this.isNew()) {
            _this.notify("afterCreate");
          } else {
            _this.notify("afterUpdate");
          }
          _this._dirty_data = {};
          _this._saved = true;
          _this._new = false;
          _this.notify("afterSave");
          return cb();
        }));
      }
      return _results;
    };

    Model.prototype["delete"] = function(cb) {
      var Adapter, adapter, _i, _len, _ref, _results,
        _this = this;
      if (!this.notify('beforeDelete')) {
        return cb(true);
      }
      _ref = this.adapters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        adapter = _ref[_i];
        Adapter = require("" + __dirname + "/adapters/" + adapter);
        adapter = new Adapter(this.config.get(adapter));
        _results.push(adapter["delete"](this._data[this.primaryIndex], this.tableName(), {
          primaryIndex: this.primaryIndex
        }, function(result) {
          var field, _j, _len1, _ref1;
          if (result === null) {
            return cb(true);
          }
          _this._data = {};
          _this._dirty_data = {};
          _ref1 = _this.fields;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            field = _ref1[_j];
            _this._data[field] = null;
          }
          _this.notify('afterDelete');
          return cb();
        }));
      }
      return _results;
    };

    Model.prototype.hasOneExists = function(model) {
      return this.hasAssociation(model, 'hasOne');
    };

    Model.prototype.hasManyExists = function(model) {
      return this.hasAssociation(model, 'hasMany');
    };

    Model.prototype.belongsToExists = function(model) {
      return this.hasAssociation(model, 'belongsTo');
    };

    Model.prototype.hasAssociation = function(model, types) {
      var association, type, _i, _j, _len, _len1, _ref;
      if (types == null) {
        types = ['hasOne', 'hasMany', 'belongsTo'];
      }
      if (!Array.isArray(types)) {
        types = [types];
      }
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        _ref = this[type]();
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          association = _ref[_j];
          if (Array.isArray(association)) {
            if (association[0].name === model.name) {
              return type;
            }
          } else {
            if (association.name === model.name) {
              return type;
            }
          }
        }
      }
      return false;
    };

    Model.prototype.getAssociation = function(model, cb) {
      var config, internalCb, type,
        _this = this;
      type = this.hasAssociation(model);
      if (type === false) {
        return cb(null);
      }
      if (this._associations[model.name] != null) {
        return cb(this._associations[model.name]);
      }
      config = this.associationConfig(model);
      internalCb = function(value) {
        if (type === "hasMany" && !Array.isArray(value)) {
          value = [value];
        }
        _this._associations[model.name] = value;
        return cb(value);
      };
      if (typeof this[config.loader] === "function") {
        return this[config.loader](internalCb);
      } else if ((type === "hasOne" || type === "belongsTo") && this.hasField(config.foreignKey)) {
        return model.find(this[config.foreignKey], internalCb);
      } else {
        return internalCb(new model());
      }
    };

    Model.prototype.associationConfig = function(model) {
      var assoc, assocName, config, defaults, key, type, val, _i, _len, _ref;
      type = this.hasAssociation(model);
      _ref = this[type];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        assoc = _ref[_i];
        if (Array.isArray(assoc)) {
          config = assoc[1];
        } else {
          config = {};
        }
      }
      defaults = {};
      assocName = model.toAssociationName(type === 'hasMany');
      assocName = assocName.charAt(0).toUpperCase() + assocName.slice(1);
      defaults.foreignKey = model.name.toLowerCase() + "_id";
      defaults.loader = "load" + assocName;
      defaults.autoFks = true;
      for (key in config) {
        if (!__hasProp.call(config, key)) continue;
        val = config[key];
        defaults[key] = val;
      }
      return defaults;
    };

    Model.prototype.isNew = function() {
      return this._new;
    };

    Model.prototype.hasField = function(name) {
      return __indexOf.call(this.fields, name) >= 0;
    };

    Model.prototype.tableName = function() {
      if (this.table) {
        return this.table;
      }
      return this.__proto__.constructor.name.toLowerCase() + "s";
    };

    Model.prototype.toJSON = function() {
      return this._data;
    };

    Model.prototype.notify = function(event) {
      return this[event]();
    };

    Model.prototype.isValid = function() {
      return true;
    };

    Model.prototype.beforeInit = function() {};

    Model.prototype.afterInit = function() {};

    Model.prototype.afterFind = function() {};

    Model.prototype.beforeSave = function() {
      return true;
    };

    Model.prototype.beforeCreate = function() {};

    Model.prototype.beforeUpdate = function() {};

    Model.prototype.afterCreate = function() {};

    Model.prototype.afterUpdate = function() {};

    Model.prototype.afterSave = function() {};

    Model.prototype.beforeDelete = function() {
      return true;
    };

    Model.prototype.afterDelete = function() {};

    return Model;

  })();

}).call(this);
