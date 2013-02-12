# No operation adapter - useful for testing or if you want to disable
# data storage for a model.
module.exports = class NoopAdapter
  @resultSet: []
  @callStack: []

  read: (args...) ->
    args.unshift "read"
    NoopAdapter.callStack.push args

    if typeof args[args.length - 1] is "function"
      args.pop()(NoopAdapter.resultSet)

  write: (args...) ->
    args.unshift "write"
    NoopAdapter.callStack.push args

    if typeof args[args.length - 1] is "function"
      args.pop()(true)

  delete: (args...) ->
    args.unshift "delete"
    NoopAdapter.callStack.push args

    if typeof args[args.length - 1] is "function"
      args.pop()(true)