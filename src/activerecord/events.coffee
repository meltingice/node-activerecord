# Used for tracking errors during queries
#
# This needs to be modified so that it supports
# callbacks added to the model itself, since observers
# were dropped.

class EventError extends Error

module.exports =
  notify: (event) ->
    return true unless @[event]?

    # throw new EventError(event) if @observer::[event].call(@) is false
    return true
