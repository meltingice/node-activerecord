(function() {
  var Configuration;

  exports.Configuration = Configuration = (function() {
    function Configuration(config) {
      this.config = config;
    }

    Configuration.prototype.get = function(adapter) {
      return this.config[adapter];
    };

    return Configuration;

  })();

}).call(this);
