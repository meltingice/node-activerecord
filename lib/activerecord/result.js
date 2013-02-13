(function() {
  var Result,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  exports.Result = Result = (function(_super) {

    __extends(Result, _super);

    function Result() {
      Result.__super__.constructor.call(this);
      this.createAccessors();
    }

    Result.prototype.createAccessors = function() {
      Object.defineProperty(this, 'first', {
        enumerable: false,
        configurable: false,
        get: function() {
          if (this.length) {
            return this[0];
          } else {
            return null;
          }
        }
      });
      return Object.defineProperty(this, 'last', {
        enumerable: false,
        configurable: false,
        get: function() {
          if (this.length) {
            return this[this.length - 1];
          } else {
            return null;
          }
        }
      });
    };

    return Result;

  })(Array);

}).call(this);
