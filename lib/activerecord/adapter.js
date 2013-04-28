(function() {
  var Adapter;

  exports.Adapter = Adapter = (function() {
    Adapter.prototype.idGeneration = {
      pre: false,
      post: true
    };

    function Adapter(config) {
      this.config = config;
      this.initialize();
    }

    Adapter.prototype.initialize = function() {};

    Adapter.prototype.create = function() {};

    Adapter.prototype.read = function() {};

    Adapter.prototype.update = function() {};

    Adapter.prototype["delete"] = function() {};

    Adapter.prototype.touch = function() {};

    return Adapter;

  })();

}).call(this);
