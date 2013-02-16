(function() {
  var IdGenerator;

  exports.IdGenerator = IdGenerator = (function() {

    function IdGenerator(config) {
      this.config = config;
      this.initialize();
    }

    IdGenerator.prototype.initialize = function() {};

    return IdGenerator;

  })();

}).call(this);
