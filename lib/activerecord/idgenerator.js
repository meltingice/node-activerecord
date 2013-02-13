(function() {
  var IdGenerator;

  exports.IdGenerator = IdGenerator = (function() {

    function IdGenerator(config) {
      this.config = config;
      this.initialize();
    }

    IdGenerator.prototype.initialize = function() {};

    IdGenerator.prototype.isAsync = function(method) {
      return this[method].length === 2;
    };

    return IdGenerator;

  })();

}).call(this);
