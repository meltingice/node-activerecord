(function() {
  var SQLMiddleware;

  module.exports = SQLMiddleware = (function() {

    SQLMiddleware.name = 'SQLMiddleware';

    SQLMiddleware.supports = {
      beforeWrite: false,
      afterWrite: true
    };

    function SQLMiddleware(config) {}

    SQLMiddleware.prototype.afterWrite = function(options, results, cb) {
      if (results) {
        return cb(null, results.lastID);
      } else {
        return cb(true, null);
      }
    };

    return SQLMiddleware;

  })();

}).call(this);
