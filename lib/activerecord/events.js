(function() {
  var EventError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventError = (function(_super) {

    __extends(EventError, _super);

    function EventError() {
      return EventError.__super__.constructor.apply(this, arguments);
    }

    return EventError;

  })(Error);

  module.exports = {
    notify: function(event) {
      if (this[event] == null) {
        return true;
      }
      if (this.observer.prototype[event].call(this) === false) {
        throw new EventError(event);
      }
      return true;
    }
  };

}).call(this);
