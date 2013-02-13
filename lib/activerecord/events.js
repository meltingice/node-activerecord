(function() {
  var ObserverError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ObserverError = (function(_super) {

    __extends(ObserverError, _super);

    function ObserverError() {
      return ObserverError.__super__.constructor.apply(this, arguments);
    }

    return ObserverError;

  })(Error);

  module.exports = {
    notify: function(event) {
      if (this.observer == null) {
        return true;
      }
      if (this.observer[event].call(this) === false) {
        throw new ObserverError(event);
      }
      return true;
    }
  };

}).call(this);
