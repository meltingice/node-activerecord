(function() {
  var Model,
    __slice = [].slice;

  exports.Model = Model = (function() {

    Model.name = 'Model';

    Model.prototype.tableName = "";

    Model.prototype._init_data = {};

    Model.prototype._data = {};

    Model.prototype._dirty_data = {};

    Model.prototype._is_dirty = false;

    Model.prototype._new = true;

    Model.prototype.primaryIndex = 'id';

    Model.prototype.fields = [];

    Model.prototype.adapters = ["sqlite"];

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

    Model.findAll = function(finder, cb) {
      var Adapter, adapter, model, results,
        _this = this;
      if (cb == null) {
        cb = function() {};
      }
      model = new this;
      Adapter = require("" + __dirname + "/adapters/" + model.adapters[0]);
      adapter = new Adapter(model.config.get(model.adapters[0]));
      return results = adapter.read(finder, model.tableName(), Array.prototype.slice.call(arguments, 0), {
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

    function Model(data, tainted) {
      var field, _fn, _i, _len, _ref,
        _this = this;
      if (data == null) {
        data = {};
      }
      if (tainted == null) {
        tainted = true;
      }
      this.notify('beforeInit');
      this._init_data = data;
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

    Model.prototype.isNew = function() {
      return this._new;
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

    return Model;

  })();

}).call(this);
