(function() {
  var Inflection;

  Inflection = require('./inflection').Inflection;

  module.exports = {
    createProperties: function() {
      var field, _i, _len, _ref, _results,
        _this = this;
      _ref = [this.primaryIndex].concat(this.fields);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        _results.push((function(field) {
          _this.data[field] = null;
          return Object.defineProperty(_this, field, {
            enumerable: true,
            configurable: false,
            get: function() {
              return this.readAttribute(field);
            },
            set: function(val) {
              if (field === this.primaryIndex) {
                return;
              }
              if (this.readAttribute(field) !== val) {
                val = this.applyAttributeFilter(field, val);
                this.writeAttribute(field, val);
                this.dirtyKeys[field] = true;
                return this.isDirty = true;
              }
            }
          });
        })(field));
      }
      return _results;
    },
    applyAttributeFilter: function(field, val) {
      var filterFunc;
      if (this.observer == null) {
        return val;
      }
      filterFunc = "filter" + (Inflection.camelize(field));
      if (this.observer.prototype[filterFunc] == null) {
        return val;
      }
      return this.observer.prototype[filterFunc].call(this, val);
    },
    readAttribute: function(attr) {
      return this.data[attr];
    },
    writeAttribute: function(attr, value) {
      return this.data[attr] = value;
    }
  };

}).call(this);
