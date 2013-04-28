# ID generation. Can support both pre and post query
# generation depending on the database system.
#
# These are especially useful for NoSQL systems that don't
# have automatic ID generation built in.

exports.IdGenerator = class IdGenerator
  constructor: (@config) -> @initialize()
  initialize: ->