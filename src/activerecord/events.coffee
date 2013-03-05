class EventError extends Error

module.exports =
  notify: (event) ->
    return true unless @[event]?

    throw new EventError(event) if @observer::[event].call(@) is false
    return true
