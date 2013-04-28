# Simple configuration class
  
exports.Configuration = class Configuration
  constructor: (@config) ->
  get: (adapter) -> @config[adapter]