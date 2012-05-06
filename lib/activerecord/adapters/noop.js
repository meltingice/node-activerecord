(function() {
  var NoopAdapter,
    __slice = [].slice;

  module.exports = NoopAdapter = (function() {

    NoopAdapter.name = 'NoopAdapter';

    function NoopAdapter() {}

    NoopAdapter.resultSet = [];

    NoopAdapter.callStack = [];

    NoopAdapter.prototype.read = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift("read");
      NoopAdapter.callStack.push(args);
      if (typeof args[args.length - 1] === "function") {
        return args.pop()(NoopAdapter.resultSet);
      }
    };

    NoopAdapter.prototype.write = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift("write");
      NoopAdapter.callStack.push(args);
      if (typeof args[args.length - 1] === "function") {
        return args.pop()(true);
      }
    };

    NoopAdapter.prototype["delete"] = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      args.unshift("delete");
      NoopAdapter.callStack.push(args);
      if (typeof args[args.length - 1] === "function") {
        return args.pop()(true);
      }
    };

    return NoopAdapter;

  })();

}).call(this);
