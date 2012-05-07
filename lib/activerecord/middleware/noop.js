(function() {
  var NoopMiddleware;

  module.exports = NoopMiddleware = (function() {

    NoopMiddleware.name = 'NoopMiddleware';

    function NoopMiddleware() {}

    NoopMiddleware.supports = {
      beforeWrite: false,
      afterWrite: false
    };

    return NoopMiddleware;

  })();

}).call(this);
