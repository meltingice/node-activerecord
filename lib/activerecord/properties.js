(function() {
  var Inflection,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  Inflection = require('./support/inflection').Inflection;

  module.exports = {
    createProperties: function() {
      var field, _i, _len, _ref, _results,
        _this = this;
      _ref = [this.primaryKey].concat(this.fields);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        _results.push((function(field) {
          return Object.defineProperty(_this, field, {
            enumerable: true,
            configurable: false,
            get: function() {
              return this.readAttribute(field);
            },
            set: function(val) {
              if (field === this.primaryKey) {
                return;
              }
              if (this.readAttribute(field) !== val) {
                val = this.applyAttributeFilter(field, val);
                this.writeAttribute(field, val);
                return this.dirtyKeys[field] = true;
              }
            }
          });
        })(field));
      }
      return _results;
    },
    readAttribute: function(attr) {
      return this.data[attr];
    },
    writeAttribute: function(attr, value) {
      this.data[attr] = value;
      return this.executeAttributeEvent(attr, value);
    },
    dirtyAttributes: function(includePrimary) {
      var data, dirty, key, _ref;
      if (includePrimary == null) {
        includePrimary = false;
      }
      if (!this.isDirty()) {
        return {};
      }
      data = {};
      if (includePrimary) {
        data[this.primaryKey] = this.readAttribute(this.primaryKey);
      }
      _ref = this.dirtyKeys;
      for (key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        dirty = _ref[key];
        if (!dirty) {
          continue;
        }
        data[key] = this.readAttribute(key);
      }
      return data;
    },
    isDirty: function() {
      return Object.keys(this.dirtyKeys).length > 0;
    },
    applyAttributeFilter: function(field, val) {
      var filterFunc, result;
      filterFunc = "filter" + (Inflection.camelize(field));
      result = this.notifyObserver(filterFunc);
      if (result === false) {
        return val;
      } else {
        return result;
      }
    },
    executeAttributeEvent: function(attr, val) {
      var func;
      func = "set" + (Inflection.camelize(attr));
      return this.notifyObserver(func, val);
    },
    notifyObserver: function() {
      var args, func;
      func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this[func] == null) {
        return false;
      }
      return this[func].apply(this, args);
    }
  };

}).call(this);
