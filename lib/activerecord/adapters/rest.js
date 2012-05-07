(function() {
  var RestAdapter, rest;

  rest = require('restler');

  module.exports = RestAdapter = (function() {

    RestAdapter.name = 'RestAdapter';

    function RestAdapter(config) {
      this.config = config;
    }

    RestAdapter.prototype.read = function(action, endpoint, params, opts, cb) {
      var url;
      url = this.buildUrl(action, endpoint);
      if (params.length === 1) {
        params = params[0];
      }
      return rest.get(url, {
        query: params
      }).on('complete', function(data, resp) {
        if (!Array.isArray(data)) {
          data = [data];
        }
        return cb(null, data);
      });
    };

    RestAdapter.prototype.write = function(id, table, data, newRecord, opts, cb) {
      return cb(null, null);
    };

    RestAdapter.prototype["delete"] = function(id, table, opts, cb) {
      return cb(null, null);
    };

    RestAdapter.prototype.buildUrl = function(action, endpoint) {
      return "" + this.config.url + "/" + this.config.version + "/" + endpoint + "/" + action + ".json";
    };

    return RestAdapter;

  })();

}).call(this);
